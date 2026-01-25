from typing import List, Dict

from runtime_analyzer.application.helpers.energy import get_nodes_energy_for_access_metric
from runtime_analyzer.domain.models import Runtime, CodeLinkContainer, CausalPair


class CodeLinkReporter:
    def __init__(self, baseline_runtime: Runtime, modified_runtime: Runtime):
        self.baseline_runtime = baseline_runtime
        self.modified_runtime = modified_runtime

    def report(self, container: CodeLinkContainer) -> str:
        # Grouping by fileId
        grouped_by_file: Dict[str, Dict[str, List[CausalPair]]] = {}

        for regression in container.regressions:
            file_id = f"{regression.code_evolution.fileId} - {regression.code_evolution.modificationType} - {regression.code_evolution.modificationSource}"
            if file_id not in grouped_by_file:
                grouped_by_file[file_id] = {"regressions": [], "improvements": []}
            grouped_by_file[file_id]["regressions"].append(regression)

        for improvement in container.improvements:
            file_id = f"{improvement.code_evolution.fileId} - {improvement.code_evolution.modificationType} - {improvement.code_evolution.modificationSource}"
            if file_id not in grouped_by_file:
                grouped_by_file[file_id] = {"regressions": [], "improvements": []}
            grouped_by_file[file_id]["improvements"].append(improvement)

        html_output = self._generate_html_header()

        for file_id, pairs in grouped_by_file.items():
            html_output += self._generate_file_report(file_id, pairs["regressions"], pairs["improvements"])

        html_output += "</body></html>"
        return html_output

    def _generate_html_header(self) -> str:
        return """
        <html>
        <head>
        <style>
            table { border-collapse: collapse; width: 100%; font-family: sans-serif; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1, h2 { font-family: sans-serif; }
        </style>
        </head>
        <body>
        <h1>Code Linkage Analysis Report</h1>
        """

    def _generate_file_report(self, file_id: str, regressions: List[CausalPair], improvements: List[CausalPair]) -> str:
        baseline_nodes = []
        modified_nodes = []

        all_pairs = regressions + improvements
        for p in all_pairs:
            node_id = p.node_id
            try:
                node_baseline = self.baseline_runtime.get_node_by_id(node_id)
                baseline_nodes.append(node_baseline)
            except ValueError:
                pass

            try:
                node_modified = self.modified_runtime.get_node_by_id(node_id)
                modified_nodes.append(node_modified)
            except ValueError:
                pass

        (baseline_read_counter, baseline_write_counter, baseline_read_size,
         baseline_write_size) = get_nodes_energy_for_access_metric(baseline_nodes)
        (modified_read_counter, modified_write_counter, modified_read_size,
         modified_write_size) = get_nodes_energy_for_access_metric(modified_nodes)

        regressions_table = self._generate_pairs_table(regressions, "regression")
        improvements_table = self._generate_pairs_table(improvements, "improvement")

        report = f"""
        <div class="file-header">
            <h2>File: {file_id}</h2>
        </div>
        <h3>Total Metrics</h3>
        <table>
            <thead>
                <tr>
                    <th>Source</th>
                    <th style="background-color: #d1d1d1;">Read Counter</th>
                    <th>Write Counter</th>
                    <th style="background-color: #d1d1d1;">Read Size</th>
                    <th>Write Size</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Baseline</td>
                    <td style="background-color: #d1d1d1;">{baseline_read_counter}</td>
                    <td>{baseline_write_counter}</td>
                    <td style="background-color: #d1d1d1;">{baseline_read_size}</td>
                    <td>{baseline_write_size}</td>
                </tr>
                <tr>
                    <td>Modified</td>
                    <td style="background-color: #d1d1d1;">{modified_read_counter}</td>
                    <td>{modified_write_counter}</td>
                    <td style="background-color: #d1d1d1;">{modified_read_size}</td>
                    <td>{modified_write_size}</td>
                </tr>
            </tbody>
        </table>

        <h3>Modified ({len(regressions)})</h3>
        {regressions_table}

        <h3>Baseline ({len(improvements)})</h3>
        {improvements_table}
        """
        return report

    def _generate_pairs_table(self, pairs: List[CausalPair], source: str) -> str:
        if not pairs:
            return "<p>None found.</p>"

        causes = {
            "Direct": {
                "node_count": 0,
                "node_type": {},
                "mod_type_count": {},
                "source_count": {},
                "span_count": {}
            },
            "Derived": {
                "node_count": 0,
                "node_type": {},
                "mod_type_count": {},
                "source_count": {},
                "span_count": {}
            }
        }

        for p in pairs:
            cause = causes[p.confidence]
            node = self.modified_runtime.get_node_by_id(
                p.node_id) if source == "regression" else self.baseline_runtime.get_node_by_id(p.node_id)

            ce = p.code_evolution
            span = f"L{ce.codeChangeSpan.lineStart}:{ce.codeChangeSpan.columnStart} - L{ce.codeChangeSpan.lineEnd}:{ce.codeChangeSpan.columnEnd}"
            cause.node_count += 1
            cause.node_type[node.type] = cause.node_type.get(node.type, 0) + 1
            cause.mod_type_count[ce.modificationType] = cause.mod_type_count.get(ce.modificationType, 0) + 1
            cause.source_count[ce.modificationSource] = cause.source_count.get(ce.modificationSource, 0) + 1
            cause.span_count[span] = cause.span_count.get(span, 0) + 1

        rows = {
            "Direct": [],
            "Derived": []
        }

        for causeKey in causes.keys():
            cause = causes[causeKey]
            rows[causeKey].append(f"<tr><td>Node</td><td>Count</td><td>{cause.node_count}</td></tr>")

            for k, v in cause.node_type.items():
                rows[causeKey].append(f"<tr><td>Node Type</td><td>{k}</td><td>{v}</td></tr>")

            for k, v in cause.mod_type_count.items():
                rows[causeKey].append(f"<tr><td>Modification Count</td><td>{k}</td><td>{v}</td></tr>")

            for k, v in cause.source_count.items():
                rows[causeKey].append(f"<tr><td>Source Count</td><td>{k}</td><td>{v}</td></tr>")

            for k, v in cause.span_count.items():
                rows[causeKey].append(f"<tr><td>Span Count</td><td>{k}</td><td>{v}</td></tr>")

            for k, v in cause.confidence_count.items():
                rows[causeKey].append(f"<tr><td>Confidence</td><td>{k}</td><td>{v}</td></tr>")

        rows_html_direct = "".join(rows["Direct"])
        rows_html_derived = "".join(rows["Derived"])

        return f"""
        <h3>Direct</h3>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                {rows_html_direct}
            </tbody>
        </table>
        
        <h3>Derived</h3>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                {rows_html_derived}
            </tbody>
        </table>
        """
