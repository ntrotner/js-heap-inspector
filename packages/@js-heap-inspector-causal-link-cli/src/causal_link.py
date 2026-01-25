import argparse
import json
import sys

from runtime_analyzer.application.reporter.code_link.code_link_reporter import CodeLinkReporter
from runtime_analyzer.application.reporter.matching.matching_reporter import MatchingReporter
from runtime_analyzer.application.services.runtime_causal_link.runtime_causal_link import RuntimeCausalLinkService
from runtime_analyzer.application.services.runtime_parser.runtime_parser import RuntimeParserService
from runtime_analyzer.application.services.matching.heuristic_matching_algorithm import HeuristicMatchingAlgorithm
from runtime_analyzer.application.services.subgraph_creation.community_creation_subgraph_algorithm import \
    CommunityDetectionSubgraphAlgorithm
from runtime_analyzer.application.services.subgraph_creation.greedy_k_hop_subgraph_algorithm import \
    GreedyKHopSubgraphAlgorithm
from runtime_analyzer.application.services.subgraph_creation.primitive_subgraph_algorithm import \
    PrimitiveSubgraphAlgorithm
from runtime_analyzer.application.services.code_link.deterministic_code_link_algorithm import DeterministicLinkage
from runtime_analyzer.domain.exceptions import ParsingError, InvalidRuntimeError, UnsupportedAlgorithmError
from runtime_analyzer.domain.models import CodeEvolution

STRATEGY_MAP = {
    "heuristic-greedy": {
        "matching": HeuristicMatchingAlgorithm,
        "subgraph": GreedyKHopSubgraphAlgorithm,
        "code_link": DeterministicLinkage
    },
    "community-detection": {
        "matching": HeuristicMatchingAlgorithm,
        "subgraph": CommunityDetectionSubgraphAlgorithm,
        "code_link": DeterministicLinkage
    },
    "primitive": {
        "matching": HeuristicMatchingAlgorithm,
        "subgraph": PrimitiveSubgraphAlgorithm,
        "code_link": DeterministicLinkage
    }
}

def main():
    parser = argparse.ArgumentParser(description="Compare two V8 heap snapshots in common runtime format.")
    parser.add_argument("--baseline", required=True, help="Path to the baseline runtime JSON file.")
    parser.add_argument("--modified", required=True, help="Path to the modified runtime JSON file.")
    parser.add_argument("--settings", help="Path to the settings JSON file.")
    parser.add_argument("--codeEvolution", help="Path to the code evolution JSON file.")
    parser.add_argument("--output", help="Path to save the comparison result (JSON).")
    parser.add_argument("--outputReporter", help="Path to save the reporter output (HTML).")

    args = parser.parse_args()

    settings = {}
    if args.settings:
        with open(args.settings, 'r') as f:
            settings = json.load(f)

    strategy_name = settings.get("strategy") or "unknown"
    strategy_params = settings.get("parameters", {})

    parser_service = RuntimeParserService()

    try:
        # Load baseline
        with open(args.baseline, 'r') as f:
            baseline_raw = f.read()
        baseline_runtime = parser_service.parse(baseline_raw)
        if not baseline_runtime.nodes:
            raise InvalidRuntimeError("Baseline runtime has no nodes.")

        # Load modified
        with open(args.modified, 'r') as f:
            modified_raw = f.read()
        modified_runtime = parser_service.parse(modified_raw)
        if not modified_runtime.nodes:
            raise InvalidRuntimeError("Modified runtime has no nodes.")

        # Get strategy components
        strategy = STRATEGY_MAP.get(strategy_name)
        if not strategy:
            raise UnsupportedAlgorithmError(f"Strategy '{strategy_name}' is not supported.")

        with open(args.codeEvolution, 'r') as f:
            code_evolutions_raw = f.read()
        code_evolutions = json.loads(code_evolutions_raw)
        code_evolutions_baseline = []
        code_evolutions_modified = []

        for code_evolution in code_evolutions:
            parsed_code_evolution = CodeEvolution.model_validate(code_evolution)

            if parsed_code_evolution.modificationSource == "base":
                code_evolutions_baseline.append(parsed_code_evolution)
            if parsed_code_evolution.modificationSource == "modified":
                code_evolutions_modified.append(parsed_code_evolution)

        # Initialize service
        service = RuntimeCausalLinkService(
            differentiation_algorithm=strategy["matching"],
            subgraph_algorithm=strategy["subgraph"],
            code_link_algorithm=strategy["code_link"],
            differentiation_params=strategy_params.get("matching"),
            subgraph_params=strategy_params.get("subgraph"),
            code_link_params=strategy_params.get("code_link")
        )

        matching_result, code_links, time_tracking = service.compare(
            baseline=baseline_runtime,
            code_evolution_baseline=code_evolutions_baseline,
            modified=modified_runtime,
            code_evolution_modified=code_evolutions_modified
        )

        result = {
            "time_tracking": time_tracking,
            "matching": matching_result.model_dump(),
            "causal_links": code_links.model_dump()
        }

        # Output result
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"Results saved to {args.output}")
        else:
            print(json.dumps(result, indent=2))
            
        if args.outputReporter:
            matching_report_html = MatchingReporter(baseline_runtime, modified_runtime).report(matching_result)
            with open(f'{args.outputReporter}-matching_report.html', 'w') as f:
                f.write(matching_report_html)
            print(f"Reporter saved to {args.outputReporter}-matching_report.html")

            code_link_report_html = CodeLinkReporter(baseline_runtime, modified_runtime).report(code_links)
            with open(f'{args.outputReporter}-code_link_report.html', 'w') as f:
                f.write(code_link_report_html)
            print(f"Reporter saved to {args.outputReporter}-code_link_report.html")

    except FileNotFoundError as e:
        print(f"Error: File not found: {e.filename}", file=sys.stderr)
        sys.exit(1)
    except ParsingError as e:
        print(f"Error parsing runtime data: {str(e)}", file=sys.stderr)
        sys.exit(1)
    except InvalidRuntimeError as e:
        print(f"Error: Invalid runtime data: {str(e)}", file=sys.stderr)
        sys.exit(1)
    except UnsupportedAlgorithmError as e:
        print(f"Error: Unsupported algorithm: {str(e)}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
