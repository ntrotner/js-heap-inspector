from typing import List, Dict, Any


from runtime_analyzer.application.helpers import get_nodes_total_energy_difference_for_access_metric
from runtime_analyzer.application.helpers.energy import get_nodes_energy_for_access_metric
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

        matched_node_ids_baseline = [node_id for m in matching_result.matched for node_id in m.nodes_baseline_id]
        matched_node_ids_modified = [node_id for m in matching_result.matched for node_id in m.nodes_modified_id]
        modified_node_ids_baseline = [node_id for m in matching_result.modified for node_id in m.nodes_baseline_id]
        modified_node_ids_modified = [node_id for m in matching_result.modified for node_id in m.nodes_modified_id]
        added_node_ids_baseline = [node_id for m in matching_result.added_node_ids for node_id in m.nodes_baseline_id]
        added_node_ids_modified = [node_id for m in matching_result.added_node_ids for node_id in m.nodes_modified_id]
        removed_node_ids_baseline = [node_id for m in matching_result.removed_node_ids for node_id in m.nodes_baseline_id]
        removed_node_ids_modified = [node_id for m in matching_result.removed_node_ids for node_id in m.nodes_modified_id]

        matched_analytics_html = self._present_node_analytics_as_html(
            "Matched Elements Analytics",
            self._get_node_analytics(matched_node_ids_baseline, self.baseline_runtime),
            self._get_node_analytics(matched_node_ids_modified, self.modified_runtime)
        )
        modified_analytics_html = self._present_node_analytics_as_html(
            "Modified Elements Analytics",
            self._get_node_analytics(modified_node_ids_baseline, self.baseline_runtime),
            self._get_node_analytics(modified_node_ids_modified, self.modified_runtime)
        )
        added_analytics_html = self._present_node_analytics_as_html(
            "Added Elements Analytics",
            self._get_node_analytics(added_node_ids_baseline, self.baseline_runtime),
            self._get_node_analytics(added_node_ids_modified, self.modified_runtime)
        )
        removed_analytics_html = self._present_node_analytics_as_html(
            "Removed Elements Analytics",
            self._get_node_analytics(removed_node_ids_baseline, self.baseline_runtime),
            self._get_node_analytics(removed_node_ids_modified, self.modified_runtime)
        )

        return f"""
        <style>
            table {{ border-collapse: collapse; width: 100%; font-family: sans-serif; margin-bottom: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: right; }}
            th {{ background-color: #f2f2f2; text-align: center; }}
            td:first-child {{ text-align: left; font-weight: bold; }}
            .improvement {{ color: green; }}
            .regression {{ color: red; }}
            .neutral {{ color: #666; }}
            h1, h2 {{ font-family: sans-serif; }}
        </style>
        <h1>Access Count Analysis Overview</h1>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Nodes (Baseline)</th>
                    <th>Nodes (Modified)</th>
                    <th>Read Counter Baseline</th>
                    <th>Read Counter Modified</th>
                    <th>Write Counter Baseline</th>
                    <th>Write Counter Modified</th>
                    <th>Read Size Baseline</th>
                    <th>Read Size Modified</th>
                    <th>Write Size Baseline</th>
                    <th>Write Size Modified</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Matched</td>
                    <td>{node_count_matched_baseline}</td>
                    <td>{node_count_matched_modified}</td>
                    <td>{total_matched.baseline_read_counter}</td>
                    <td>{total_matched.modified_read_counter}</td>
                    <td>{total_matched.baseline_write_counter}</td>
                    <td>{total_matched.modified_write_counter}</td>
                    <td>{total_matched.baseline_read_size}</td>
                    <td>{total_matched.modified_read_size}</td>
                    <td>{total_matched.baseline_write_size}</td>
                    <td>{total_matched.modified_write_size}</td>
                </tr>
                <tr>
                    <td>Modified</td>
                    <td>{node_count_modified_baseline}</td>
                    <td>{node_count_modified_modified}</td>
                    <td>{total_modified.baseline_read_counter}</td>
                    <td>{total_modified.modified_read_counter}</td>
                    <td>{total_modified.baseline_write_counter}</td>
                    <td>{total_modified.modified_write_counter}</td>
                    <td>{total_modified.baseline_read_size}</td>
                    <td>{total_modified.modified_read_size}</td>
                    <td>{total_modified.baseline_write_size}</td>
                    <td>{total_modified.modified_write_size}</td>
                </tr>
                <tr>
                    <td>Added</td>
                    <td>{node_count_added_baseline}</td>
                    <td>{node_count_added_modified}</td>
                    <td>{total_added.baseline_read_counter}</td>
                    <td>{total_added.modified_read_counter}</td>
                    <td>{total_added.baseline_write_counter}</td>
                    <td>{total_added.modified_write_counter}</td>
                    <td>{total_added.baseline_read_size}</td>
                    <td>{total_added.modified_read_size}</td>
                    <td>{total_added.baseline_write_size}</td>
                    <td>{total_added.modified_write_size}</td>
                </tr>
                <tr>
                    <td>Removed</td>
                    <td>{node_count_removed_baseline}</td>
                    <td>{node_count_removed_modified}</td>
                    <td>{total_removed.baseline_read_counter}</td>
                    <td>{total_removed.modified_read_counter}</td>
                    <td>{total_removed.baseline_write_counter}</td>
                    <td>{total_removed.modified_write_counter}</td>
                    <td>{total_removed.baseline_read_size}</td>
                    <td>{total_removed.modified_read_size}</td>
                    <td>{total_removed.baseline_write_size}</td>
                    <td>{total_removed.modified_write_size}</td>
                </tr>
            </tbody>
        </table>

        {matched_analytics_html}
        {modified_analytics_html}
        {added_analytics_html}
        {removed_analytics_html}
        """

    def _get_node_analytics(self, node_ids: List[str], runtime: Runtime) -> Dict[str, Dict[str, Any]]:
        analytics = {}
        for node_id in node_ids:
            node = runtime.get_node_by_id(node_id)
            if node.type not in analytics:
                analytics[node.type] = {"count": 0, "total_size": 0}
            analytics[node.type]["count"] += 1
            if node.energy:
                analytics[node.type]["total_size"] += node.energy.size
        return analytics

    def _present_node_analytics_as_html(self, title: str, baseline_analytics: Dict[str, Dict[str, Any]],
                                       modified_analytics: Dict[str, Dict[str, Any]]) -> str:
        all_types = sorted(set(baseline_analytics.keys()) | set(modified_analytics.keys()))
        if not all_types:
            return ""

        rows = ""
        for node_type in all_types:
            baseline = baseline_analytics.get(node_type, {"count": 0, "total_size": 0})
            modified = modified_analytics.get(node_type, {"count": 0, "total_size": 0})
            rows += f"""
                <tr>
                    <td>{node_type}</td>
                    <td>{baseline["count"]}</td>
                    <td>{modified["count"]}</td>
                    <td>{baseline["total_size"]}</td>
                    <td>{modified["total_size"]}</td>
                </tr>
            """

        return f"""
            <h2>{title}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Node Type</th>
                        <th>Count (Baseline)</th>
                        <th>Count (Modified)</th>
                        <th>Total Size (Baseline)</th>
                        <th>Total Size (Modified)</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        """

    def get_total_access_count(self, subgraphs: dict[
        int, MatchingReporterAccessCountResult]) -> MatchingReporterAccessCountResult:
        total = MatchingReporterAccessCountResult(
            baseline_read_counter=0, baseline_write_counter=0, baseline_read_size=0, baseline_write_size=0,
            modified_read_counter=0, modified_write_counter=0, modified_read_size=0, modified_write_size=0
        )
        
        for _, subgraph in subgraphs.items():
            total.baseline_read_counter += subgraph.baseline_read_counter
            total.baseline_write_counter += subgraph.baseline_write_counter
            total.baseline_read_size += subgraph.baseline_read_size
            total.baseline_write_size += subgraph.baseline_write_size
            total.modified_read_counter += subgraph.modified_read_counter
            total.modified_write_counter += subgraph.modified_write_counter
            total.modified_read_size += subgraph.modified_read_size
            total.modified_write_size += subgraph.modified_write_size
        
        return total

    def analyze_matched_elements_access_count(self, matched_elements: List[MatchSubgraphResult]) -> dict[
        int, MatchingReporterAccessCountResult]:
        subgraphs: dict[int, MatchingReporterAccessCountResult] = {}

        for index, match in enumerate(matched_elements):
            # negative values indicate an improvement
            baseline_nodes = self.get_nodes_from_baseline(match.nodes_baseline_id)
            (baseline_read_counter, baseline_write_counter, baseline_read_size,
             baseline_write_size) = get_nodes_energy_for_access_metric(baseline_nodes)

            modified_nodes = self.get_nodes_from_modified(match.nodes_modified_id)
            (modified_read_counter, modified_write_counter, modified_read_size,
             modified_write_size) = get_nodes_energy_for_access_metric(modified_nodes)

            subgraphs[index] = MatchingReporterAccessCountResult(
                baseline_read_counter=baseline_read_counter,
                baseline_write_counter=baseline_write_counter,
                baseline_read_size=baseline_read_size,
                baseline_write_size=baseline_write_size,
                modified_read_counter=modified_read_counter,
                modified_write_counter=modified_write_counter,
                modified_read_size=modified_read_size,
                modified_write_size=modified_write_size
            )

        return subgraphs

    def analyze_modified_elements_access_count(self, modified_elements: List[ModificationSubgraphResult]) -> dict[
        int, MatchingReporterAccessCountResult]:
        subgraphs: dict[int, MatchingReporterAccessCountResult] = {}

        for index, modification in enumerate(modified_elements):
            baseline_nodes = self.get_nodes_from_baseline(modification.nodes_baseline_id)
            (baseline_read_counter, baseline_write_counter, baseline_read_size,
             baseline_write_size) = get_nodes_energy_for_access_metric(baseline_nodes)

            modified_nodes = self.get_nodes_from_modified(modification.nodes_modified_id)
            (modified_read_counter, modified_write_counter, modified_read_size,
             modified_write_size) = get_nodes_energy_for_access_metric(modified_nodes)

            subgraphs[index] = MatchingReporterAccessCountResult(
                baseline_read_counter=baseline_read_counter,
                baseline_write_counter=baseline_write_counter,
                baseline_read_size=baseline_read_size,
                baseline_write_size=baseline_write_size,
                modified_read_counter=modified_read_counter,
                modified_write_counter=modified_write_counter,
                modified_read_size=modified_read_size,
                modified_write_size=modified_write_size
            )

        return subgraphs

    def analyze_added_elements_access_count(self, added_elements: List[DeltaSubgraphResult]) -> dict[
        int, MatchingReporterAccessCountResult]:
        subgraphs: dict[int, MatchingReporterAccessCountResult] = {}

        for index, addition in enumerate(added_elements):
            baseline_nodes = self.get_nodes_from_baseline(addition.nodes_baseline_id)
            (baseline_read_counter, baseline_write_counter, baseline_read_size,
             baseline_write_size) = get_nodes_energy_for_access_metric(baseline_nodes)

            modified_nodes = self.get_nodes_from_modified(addition.nodes_modified_id)
            (modified_read_counter, modified_write_counter, modified_read_size,
             modified_write_size) = get_nodes_energy_for_access_metric(modified_nodes)

            subgraphs[index] = MatchingReporterAccessCountResult(
                baseline_read_counter=baseline_read_counter,
                baseline_write_counter=baseline_write_counter,
                baseline_read_size=baseline_read_size,
                baseline_write_size=baseline_write_size,
                modified_read_counter=modified_read_counter,
                modified_write_counter=modified_write_counter,
                modified_read_size=modified_read_size,
                modified_write_size=modified_write_size
            )

        return subgraphs

    def analyze_removed_elements_access_count(self, removed_elements: List[DeltaSubgraphResult]) -> dict[
        int, MatchingReporterAccessCountResult]:
        subgraphs: dict[int, MatchingReporterAccessCountResult] = {}

        for index, removal in enumerate(removed_elements):
            baseline_nodes = self.get_nodes_from_baseline(removal.nodes_baseline_id)
            (baseline_read_counter, baseline_write_counter, baseline_read_size,
             baseline_write_size) = get_nodes_energy_for_access_metric(baseline_nodes)

            modified_nodes = self.get_nodes_from_modified(removal.nodes_modified_id)
            (modified_read_counter, modified_write_counter, modified_read_size,
             modified_write_size) = get_nodes_energy_for_access_metric(modified_nodes)

            subgraphs[index] = MatchingReporterAccessCountResult(
                baseline_read_counter=baseline_read_counter,
                baseline_write_counter=baseline_write_counter,
                baseline_read_size=baseline_read_size,
                baseline_write_size=baseline_write_size,
                modified_read_counter=modified_read_counter,
                modified_write_counter=modified_write_counter,
                modified_read_size=modified_read_size,
                modified_write_size=modified_write_size
            )

        return subgraphs

    def get_nodes_from_baseline(self, node_ids: list[str]) -> list[Node]:
        return [self.baseline_runtime.get_node_by_id(node_id) for node_id in node_ids]

    def get_nodes_from_modified(self, node_ids: list[str]) -> list[Node]:
        return [self.modified_runtime.get_node_by_id(node_id) for node_id in node_ids]
