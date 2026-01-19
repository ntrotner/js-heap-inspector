from typing import List, Dict

from runtime_analyzer.application.helpers.energy import get_nodes_energy_for_access_metric
from runtime_analyzer.domain.models import Runtime, CodeLinkContainer, CausalPair
from runtime_analyzer.application.helpers import get_nodes_total_energy_difference_for_access_metric

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
            .improvement { color: green; }
            .regression { color: red; }
            .neutral { color: #666; }
            h1, h2 { font-family: sans-serif; }
            .file-header { background-color: #e9e9e9; padding: 10px; border-radius: 5px; margin-top: 30px; }
        </style>
        </head>
        <body>
        <h1>Code Linkage Analysis Report</h1>
        """

    def _generate_file_report(self, file_id: str, regressions: List[CausalPair], improvements: List[CausalPair]) -> str:
        baseline_nodes = []
        modified_nodes = []
        
        for p in regressions + improvements:
            try:
                node_baseline = self.baseline_runtime.get_node_by_id(p.node_id)
                baseline_nodes.append(node_baseline)
            except ValueError:
                pass
            
            try:
                node_modified = self.modified_runtime.get_node_by_id(p.node_id)
                modified_nodes.append(node_modified)
            except ValueError:
                pass

        (baseline_read_counter, baseline_write_counter, baseline_read_size, baseline_write_size) = get_nodes_energy_for_access_metric(baseline_nodes)
        (modified_read_counter, modified_write_counter, modified_read_size, modified_write_size) = get_nodes_energy_for_access_metric(modified_nodes)
        
        report = f"""
        <div class="file-header">
            <h2>File: {file_id}</h2>
        </div>
        <h3>Total Metrics Difference</h3>
        <table>
            <thead>
                <tr>
                    <th>Source</th>
                    <th>Read Counter Diff</th>
                    <th>Write Counter Diff</th>
                    <th>Read Size Diff</th>
                    <th>Write Size Diff</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Baseline</td>
                    <td>{baseline_read_counter}</td>
                    <td>{baseline_write_counter}</td>
                    <td>{baseline_read_size}</td>
                    <td>{baseline_write_size}</td>
                </tr>
                <tr>
                    <td>Modified</td>
                    <td>{modified_read_counter}</td>
                    <td>{modified_write_counter}</td>
                    <td>{modified_read_size}</td>
                    <td>{modified_write_size}</td>
                </tr>
            </tbody>
        </table>

        <h3>Regressions ({len(regressions)})</h3>
        {self._generate_pairs_table(regressions)}

        <h3>Improvements ({len(improvements)})</h3>
        {self._generate_pairs_table(improvements)}
        """
        return report

    def _generate_pairs_table(self, pairs: List[CausalPair]) -> str:
        if not pairs:
            return "<p>None found.</p>"
        
        node_count = 0
        mod_type_count: Dict[str, int] = {}
        source_count: Dict[str, int] = {}
        span_count: Dict[str, int] = {}
        confidence_count: Dict[str, int] = {}
        
        for p in pairs:
            ce = p.code_evolution
            span = f"L{ce.codeChangeSpan.lineStart}:{ce.codeChangeSpan.columnStart} - L{ce.codeChangeSpan.lineEnd}:{ce.codeChangeSpan.columnEnd}"
            confidence_count[p.confidence] = confidence_count.get(p.confidence, 0) + 1
            node_count += 1
            mod_type_count[ce.modificationType] = mod_type_count.get(ce.modificationType, 0) + 1
            source_count[ce.modificationSource] = source_count.get(ce.modificationSource, 0) + 1
            span_count[span] = span_count.get(span, 0) + 1
        
        rows = ""
        rows += f"<tr><td>Node</td><td>Count</td><td>{node_count}</td></tr>"
        
        for k, v in mod_type_count.items():
            rows += f"<tr><td>Modification Count</td><td>{k}</td><td>{v}</td></tr>"
        
        for k, v in source_count.items():
            rows += f"<tr><td>Source Count</td><td>{k}</td><td>{v}</td></tr>"
        
        for k, v in span_count.items():
            rows += f"<tr><td>Span Count</td><td>{k}</td><td>{v}</td></tr>"

        for k, v in confidence_count.items():
            rows += f"<tr><td>Confidence</td><td>{k}</td><td>{v}</td></tr>"
        
        return f"""
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
        """
