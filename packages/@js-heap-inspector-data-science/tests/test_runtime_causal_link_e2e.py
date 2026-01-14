import json
import pytest
from runtime_analyzer.application.services.runtime_parser.runtime_parser import RuntimeParserService
from runtime_analyzer.application.services.runtime_causal_link.runtime_causal_link import RuntimeCausalLinkService
from runtime_analyzer.application.services.matching.heuristic_matching_algorithm import HeuristicMatchingAlgorithm
from runtime_analyzer.application.services.subgraph_creation.greedy_k_hop_subgraph_algorithm import GreedyKHopSubgraphAlgorithm
from runtime_analyzer.application.services.code_link.deterministic_code_link_algorithm import DeterministicLinkage
from runtime_analyzer.domain.models import CodeEvolution, CodeChangeSpan

def test_runtime_causal_link_e2e():
    parser = RuntimeParserService()
    
    # Baseline runtime data
    baseline_raw = {
        "nodes": [
            {"id": "n1", "edgeIds": ["e1"], "type": "root", "root": True},
            {"id": "n2", "edgeIds": [], "type": "object", "value": "old_value", "traceId": "s1"}
        ],
        "edges": [
            {"id": "e1", "fromNodeId": "n1", "toNodeId": "n2", "name": "ref"}
        ],
        "stacks": [
            {"id": "s1", "frameIds": [], "functionName": "func", "scriptName": "app.js", "lineNumber": 10, "columnNumber": 1}
        ]
    }
    
    # Modified runtime data - n2 changed value, n3 added
    modified_raw = {
        "nodes": [
            {"id": "n1", "edgeIds": ["e1"], "type": "root", "root": True},
            {"id": "n2", "edgeIds": ["e2"], "type": "object", "value": "new_value", "traceId": "s1"},
            {"id": "n3", "edgeIds": [], "type": "object", "value": "added_value", "traceId": "s2"}
        ],
        "edges": [
            {"id": "e1", "fromNodeId": "n1", "toNodeId": "n2", "name": "ref"},
            {"id": "e2", "fromNodeId": "n2", "toNodeId": "n3", "name": "child"}
        ],
        "stacks": [
            {"id": "s1", "frameIds": [], "functionName": "func", "scriptName": "app.js", "lineNumber": 10, "columnNumber": 1},
            {"id": "s2", "frameIds": [], "functionName": "func2", "scriptName": "app.js", "lineNumber": 20, "columnNumber": 1}
        ]
    }
    
    baseline_runtime = parser.parse(json.dumps(baseline_raw))
    modified_runtime = parser.parse(json.dumps(modified_raw))
    
    # Code evolutions
    ce_baseline = [
        CodeEvolution(
            fileId="app.js",
            modificationType="modify",
            modificationSource="base",
            codeChangeSpan=CodeChangeSpan(lineStart=5, lineEnd=15, columnStart=0, columnEnd=100)
        )
    ]
    
    ce_modified = [
        CodeEvolution(
            fileId="app.js",
            modificationType="insert",
            modificationSource="modified",
            codeChangeSpan=CodeChangeSpan(lineStart=18, lineEnd=25, columnStart=0, columnEnd=100)
        )
    ]
    
    # Service initialization
    service = RuntimeCausalLinkService(
        differentiation_algorithm=HeuristicMatchingAlgorithm,
        subgraph_algorithm=GreedyKHopSubgraphAlgorithm,
        code_link_algorithm=DeterministicLinkage
    )
    
    # Compare
    matching_result, code_link = service.compare(
        baseline=baseline_runtime,
        code_evolution_baseline=ce_baseline,
        modified=modified_runtime,
        code_evolution_modified=ce_modified
    )
    
    # Assertions
    assert matching_result is not None
    assert code_link is not None
    
    assert len(matching_result.modified) > 0
    modified_node_ids = []
    for m in matching_result.modified:
        modified_node_ids.extend(m.nodes_modified_id)
    
    assert "n2" in modified_node_ids
    assert "n3" in modified_node_ids

    # Verify code link
    # n3 should be linked to ce_modified as regression
    assert len(code_link.regressions) > 0
    regression_node_ids = [p.node_id for p in code_link.regressions]
    assert "n2" not in regression_node_ids
    assert "n3" in regression_node_ids
