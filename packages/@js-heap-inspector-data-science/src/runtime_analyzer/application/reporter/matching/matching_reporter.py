from typing import List

from runtime_analyzer.application.helpers import get_nodes_total_energy_difference_for_access_metric
from runtime_analyzer.domain.models import MatchingResult, MatchSubgraphResult, ModificationSubgraphResult, \
    DeltaSubgraphResult, Runtime, MatchingReporterAccessCountResult
from runtime_analyzer.domain.models import Node


class MatchingReporter:
    def __init__(self, baseline_runtime: Runtime, modified_runtime: Runtime):
        self.baseline_runtime = baseline_runtime
        self.modified_runtime = modified_runtime

    def report(self, matching_result: MatchingResult) -> str:
        return self.present_total_access_count_as_html(matching_result)

    def present_total_access_count_as_html(self, matching_result: MatchingResult):
        matched_elements_access_count = self.analyze_matched_elements_access_count(matching_result.matched)
        modified_elements_access_count = self.analyze_modified_elements_access_count(matching_result.modified)
        added_elements_access_count = self.analyze_added_elements_access_count(matching_result.added_node_ids)
        removed_elements_access_count = self.analyze_removed_elements_access_count(matching_result.removed_node_ids)

        total_matched = self.get_total_access_count(matched_elements_access_count)
        total_modified = self.get_total_access_count(modified_elements_access_count)
        total_added = self.get_total_access_count(added_elements_access_count)
        total_removed = self.get_total_access_count(removed_elements_access_count)

        node_count_matched_baseline = sum(len(m.nodes_baseline_id) for m in matching_result.matched)
        node_count_matched_modified = sum(len(m.nodes_modified_id) for m in matching_result.matched)
        
        node_count_modified_baseline = sum(len(m.nodes_baseline_id) for m in matching_result.modified)
        node_count_modified_modified = sum(len(m.nodes_modified_id) for m in matching_result.modified)
        
        node_count_added_baseline = sum(len(m.nodes_baseline_id) for m in matching_result.added_node_ids)
        node_count_added_modified = sum(len(m.nodes_modified_id) for m in matching_result.added_node_ids)
        
        node_count_removed_baseline = sum(len(m.nodes_baseline_id) for m in matching_result.removed_node_ids)
        node_count_removed_modified = sum(len(m.nodes_modified_id) for m in matching_result.removed_node_ids)

        def format_diff(value: int) -> str:
            if value > 0:
                return f"<span style='color: red;'>+{value} (Regression)</span>"
            elif value < 0:
                return f"<span style='color: green;'>{value} (Improvement)</span>"
            else:
                return f"<span>0</span>"

        return f"""
        <style>
            table {{ border-collapse: collapse; width: 100%; font-family: sans-serif; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: right; }}
            th {{ background-color: #f2f2f2; text-align: center; }}
            td:first-child {{ text-align: left; font-weight: bold; }}
            .improvement {{ color: green; }}
            .regression {{ color: red; }}
            .neutral {{ color: #666; }}
            h1 {{ font-family: sans-serif; }}
        </style>
        <h1>Access Count Analysis Overview</h1>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Nodes (Baseline)</th>
                    <th>Nodes (Modified)</th>
                    <th>Read Counter Diff</th>
                    <th>Write Counter Diff</th>
                    <th>Read Size Diff</th>
                    <th>Write Size Diff</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Matched</td>
                    <td>{node_count_matched_baseline}</td>
                    <td>{node_count_matched_modified}</td>
                    <td>{format_diff(total_matched.read_counter_diff)}</td>
                    <td>{format_diff(total_matched.write_counter_diff)}</td>
                    <td>{format_diff(total_matched.read_size_diff)}</td>
                    <td>{format_diff(total_matched.write_size_diff)}</td>
                </tr>
                <tr>
                    <td>Modified</td>
                    <td>{node_count_modified_baseline}</td>
                    <td>{node_count_modified_modified}</td>
                    <td>{format_diff(total_modified.read_counter_diff)}</td>
                    <td>{format_diff(total_modified.write_counter_diff)}</td>
                    <td>{format_diff(total_modified.read_size_diff)}</td>
                    <td>{format_diff(total_modified.write_size_diff)}</td>
                </tr>
                <tr>
                    <td>Added</td>
                    <td>{node_count_added_baseline}</td>
                    <td>{node_count_added_modified}</td>
                    <td>{format_diff(total_added.read_counter_diff)}</td>
                    <td>{format_diff(total_added.write_counter_diff)}</td>
                    <td>{format_diff(total_added.read_size_diff)}</td>
                    <td>{format_diff(total_added.write_size_diff)}</td>
                </tr>
                <tr>
                    <td>Removed</td>
                    <td>{node_count_removed_baseline}</td>
                    <td>{node_count_removed_modified}</td>
                    <td>{format_diff(total_removed.read_counter_diff)}</td>
                    <td>{format_diff(total_removed.write_counter_diff)}</td>
                    <td>{format_diff(total_removed.read_size_diff)}</td>
                    <td>{format_diff(total_removed.write_size_diff)}</td>
                </tr>
            </tbody>
        </table>
        """


    def get_total_access_count(self, access_count_results: dict[
        int, MatchingReporterAccessCountResult]) -> MatchingReporterAccessCountResult:
        total_access_count = MatchingReporterAccessCountResult(
            read_counter_diff=sum(subgraph.read_counter_diff for subgraph in access_count_results.values()),
            write_counter_diff=sum(subgraph.write_counter_diff for subgraph in access_count_results.values()),
            read_size_diff=sum(subgraph.read_size_diff for subgraph in access_count_results.values()),
            write_size_diff=sum(subgraph.write_size_diff for subgraph in access_count_results.values()),
        )

        return total_access_count

    def analyze_matched_elements_access_count(self, matched_elements: List[MatchSubgraphResult]) -> dict[
        int, MatchingReporterAccessCountResult]:
        subgraphs: dict[int, MatchingReporterAccessCountResult] = {}

        for index, match in enumerate(matched_elements):
            read_counter_diff, write_counter_diff, read_size_diff, write_size_diff = \
                get_nodes_total_energy_difference_for_access_metric(
                    self.get_nodes_from_baseline(match.nodes_baseline_id),
                    self.get_nodes_from_modified(match.nodes_modified_id))

            subgraphs[index] = MatchingReporterAccessCountResult(
                read_counter_diff=read_counter_diff,
                write_counter_diff=write_counter_diff,
                read_size_diff=read_size_diff,
                write_size_diff=write_size_diff
            )

        return subgraphs

    def analyze_modified_elements_access_count(self, modified_elements: List[ModificationSubgraphResult]) -> dict[
        int, MatchingReporterAccessCountResult]:
        subgraphs: dict[int, MatchingReporterAccessCountResult] = {}

        for index, modification in enumerate(modified_elements):
            read_counter_diff, write_counter_diff, read_size_diff, write_size_diff = \
                get_nodes_total_energy_difference_for_access_metric(
                    self.get_nodes_from_baseline(modification.nodes_baseline_id),
                    self.get_nodes_from_modified(modification.nodes_modified_id))

            subgraphs[index] = MatchingReporterAccessCountResult(
                read_counter_diff=read_counter_diff,
                write_counter_diff=write_counter_diff,
                read_size_diff=read_size_diff,
                write_size_diff=write_size_diff
            )

        return subgraphs

    def analyze_added_elements_access_count(self, added_elements: List[DeltaSubgraphResult]) -> dict[
        int, MatchingReporterAccessCountResult]:
        subgraphs: dict[int, MatchingReporterAccessCountResult] = {}

        for index, addition in enumerate(added_elements):
            read_counter_diff, write_counter_diff, read_size_diff, write_size_diff = \
                get_nodes_total_energy_difference_for_access_metric(
                    self.get_nodes_from_baseline(addition.nodes_baseline_id),
                    self.get_nodes_from_modified(addition.nodes_modified_id))

            subgraphs[index] = MatchingReporterAccessCountResult(
                read_counter_diff=read_counter_diff,
                write_counter_diff=write_counter_diff,
                read_size_diff=read_size_diff,
                write_size_diff=write_size_diff
            )

        return subgraphs

    def analyze_removed_elements_access_count(self, removed_elements: List[DeltaSubgraphResult]) -> dict[
        int, MatchingReporterAccessCountResult]:
        subgraphs: dict[int, MatchingReporterAccessCountResult] = {}

        for index, removal in enumerate(removed_elements):
            read_counter_diff, write_counter_diff, read_size_diff, write_size_diff = \
                get_nodes_total_energy_difference_for_access_metric(
                    self.get_nodes_from_baseline(removal.nodes_baseline_id),
                    self.get_nodes_from_modified(removal.nodes_modified_id))

            subgraphs[index] = MatchingReporterAccessCountResult(
                read_counter_diff=read_counter_diff,
                write_counter_diff=write_counter_diff,
                read_size_diff=read_size_diff,
                write_size_diff=write_size_diff
            )

        return subgraphs

    def get_nodes_from_baseline(self, node_ids: list[str]) -> list[Node]:
        return [self.baseline_runtime.get_node_by_id(node_id) for node_id in node_ids]

    def get_nodes_from_modified(self, node_ids: list[str]) -> list[Node]:
        return [self.modified_runtime.get_node_by_id(node_id) for node_id in node_ids]
