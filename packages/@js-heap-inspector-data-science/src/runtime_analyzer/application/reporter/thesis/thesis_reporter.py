from typing import List, Dict, Any
from runtime_analyzer.domain.models import Runtime, MatchingResult, CodeLinkContainer, Node, CausalPair
from runtime_analyzer.application.helpers.energy import get_nodes_energy_for_access_metric

class ThesisReporter:
    def __init__(self, baseline_runtime: Runtime, modified_runtime: Runtime):
        self.baseline_runtime = baseline_runtime
        self.modified_runtime = modified_runtime

    def report(self, matching_result: MatchingResult, code_links: CodeLinkContainer, time_tracking: Dict[str, float], settings: Dict[str, Any]) -> Dict[str, Any]:
        baseline_read_counter, baseline_write_counter, baseline_read_size, baseline_write_size = get_nodes_energy_for_access_metric(self.baseline_runtime.nodes)
        modified_read_counter, modified_write_counter, modified_read_size, modified_write_size = get_nodes_energy_for_access_metric(self.modified_runtime.nodes)

        report = {
            "input": {
                "strategy": settings.get("strategy", ""),
                "parameters": settings.get("parameters", {}),
                "code_link": {
                    "distance": settings.get("parameters", {}).get("code_link", {}).get("max_distance", 0)
                },
                "baseline": {
                    "nodes": len(self.baseline_runtime.nodes),
                    "edges": len(self.baseline_runtime.edges),
                    "stacks": len(self.baseline_runtime.stacks),
                    "read_counter": baseline_read_counter,
                    "write_counter": baseline_write_counter,
                    "read_size": baseline_read_size,
                    "write_size": baseline_write_size
                },
                "modified": {
                    "nodes": len(self.modified_runtime.nodes),
                    "edges": len(self.modified_runtime.edges),
                    "stacks": len(self.modified_runtime.stacks),
                    "read_counter": modified_read_counter,
                    "write_counter": modified_write_counter,
                    "read_size": modified_read_size,
                    "write_size": modified_write_size
                }
            },
            "output": {
                "time_tracking": time_tracking,
                "subgraph": {
                    "baseline": len(matching_result.matched) + len(matching_result.modified) + len(matching_result.removed_node_ids),
                    "modified": len(matching_result.matched) + len(matching_result.modified) + len(matching_result.added_node_ids)
                },
                "baseline": self._generate_runtime_metrics(matching_result, "baseline"),
                "modified": self._generate_runtime_metrics(matching_result, "modified"),
                "code_link": self._generate_code_link_metrics(code_links)
            }
        }
        return report

    def _generate_runtime_metrics(self, matching_result: MatchingResult, mode: str) -> Dict[str, Any]:
        return {
            "matched": self._get_category_metrics(matching_result.matched, mode),
            "modified": self._get_category_metrics(matching_result.modified, mode),
            "added": self._get_category_metrics(matching_result.added_node_ids, mode),
            "removed": self._get_category_metrics(matching_result.removed_node_ids, mode)
        }

    def _get_category_metrics(self, subgraphs: List[Any], mode: str) -> Dict[str, Any]:
        node_ids = []
        for sg in subgraphs:
            if mode == "baseline":
                node_ids.extend(sg.nodes_baseline_id)
            else:
                node_ids.extend(sg.nodes_modified_id)
        
        runtime = self.baseline_runtime if mode == "baseline" else self.modified_runtime
        nodes = []
        for nid in node_ids:
            try:
                nodes.append(runtime.get_node_by_id(nid))
            except ValueError:
                continue
        
        (read_counter, write_counter, read_size, write_size) = get_nodes_energy_for_access_metric(nodes)
        
        return {
            "nodes": len(nodes),
            "read_counter": read_counter,
            "write_counter": write_counter,
            "read_size": read_size,
            "write_size": write_size,
            "node_types": self._get_node_types_analytics(nodes)
        }

    def _get_node_types_analytics(self, nodes: List[Node]) -> List[Dict[str, Any]]:
        types_map = {}
        for node in nodes:
            if node.type not in types_map:
                types_map[node.type] = {
                    "type": node.type, 
                    "count": 0, 
                    "size": 0, 
                    "write_count": 0,
                    "read_count": 0
                }
            types_map[node.type]["count"] += 1
            if node.energy:
                types_map[node.type]["size"] += node.energy.size
                types_map[node.type]["write_count"] += node.energy.writeCounter
                types_map[node.type]["read_count"] += node.energy.readCounter
        return list(types_map.values())

    def _generate_code_link_metrics(self, code_links: CodeLinkContainer) -> Dict[str, Any]:
        files_report = {}
        
        # Group regressions and improvements by file
        all_pairs = code_links.regressions + code_links.improvements
        for pair in all_pairs:
            file_id = pair.code_evolution.fileId
            if file_id not in files_report:
                files_report[file_id] = {
                    "baseline": {
                        "direct": self._empty_metrics(),
                        "derived": {"distances": {}}
                    },
                    "modified": {
                        "direct": self._empty_metrics(),
                        "derived": {"distances": {}}
                    }
                }
        
        # Process regressions (modified runtime)
        self._fill_file_metrics(files_report, code_links.regressions, "modified")
        # Process improvements (baseline runtime)
        self._fill_file_metrics(files_report, code_links.improvements, "baseline")

        return {
            "unmapped_regressions": self._get_unmapped_metrics(code_links.unmappable_regressions, "modified"),
            "unmapped_improvements": self._get_unmapped_metrics(code_links.unmappable_improvements, "baseline"),
            "files": files_report
        }

    def _empty_metrics(self) -> Dict[str, Any]:
        return {
            "nodes": 0,
            "read_counter": 0,
            "write_counter": 0,
            "read_size": 0,
            "write_size": 0,
            "node_types": []
        }

    def _get_unmapped_metrics(self, node_ids: List[str], mode: str) -> Dict[str, Any]:
        runtime = self.baseline_runtime if mode == "baseline" else self.modified_runtime
        nodes = []
        for nid in node_ids:
            try:
                nodes.append(runtime.get_node_by_id(nid))
            except ValueError:
                continue
        
        (read_counter, write_counter, read_size, write_size) = get_nodes_energy_for_access_metric(nodes)
        
        return {
            "nodes": len(nodes),
            "read_counter": read_counter,
            "write_counter": write_counter,
            "read_size": read_size,
            "write_size": write_size,
            "node_types": self._get_node_types_analytics(nodes)
        }

    def _fill_file_metrics(self, files_report: Dict[str, Any], pairs: List[CausalPair], mode: str):
        # pair.confidence 0 means direct, >0 means derived (distance)
        runtime = self.baseline_runtime if mode == "baseline" else self.modified_runtime
        
        # Group by file and distance
        grouped: Dict[str, Dict[int, List[Node]]] = {}
        for pair in pairs:
            fid = pair.code_evolution.fileId
            dist = pair.confidence
            if fid not in grouped:
                grouped[fid] = {}
            if dist not in grouped[fid]:
                grouped[fid][dist] = []
            try:
                grouped[fid][dist].append(runtime.get_node_by_id(pair.node_id))
            except ValueError:
                print(f"Skipping node with ID {pair.node_id} due to ValueError")
                continue

        for fid, distances in grouped.items():
            print(fid)
            print(distances.keys())
            print(len(distances.items()))
            for dist, nodes in distances.items():
                (read_counter, write_counter, read_size, write_size) = get_nodes_energy_for_access_metric(nodes)
                metrics = {
                    "nodes": len(nodes),
                    "read_counter": read_counter,
                    "write_counter": write_counter,
                    "read_size": read_size,
                    "write_size": write_size,
                    "node_types": self._get_node_types_analytics(nodes)
                }
                
                if dist == 0:
                    files_report[fid][mode]["direct"] = metrics
                else:
                    d_entry = {"distance": dist, "metrics": metrics}
                    files_report[fid][mode]["derived"]["distances"][dist] = d_entry

    def _merge_metrics(self, target: Dict[str, Any], source: Dict[str, Any]):
        target["nodes"] += source["nodes"]
        target["read_counter"] += source["read_counter"]
        target["write_counter"] += source["write_counter"]
        target["read_size"] += source["read_size"]
        target["write_size"] += source["write_size"]
        # Merge node types
        types_map = {t["type"]: t for t in target["node_types"]}
        for st in source["node_types"]:
            if st["type"] in types_map:
                types_map[st["type"]]["count"] += st["count"]
                types_map[st["type"]]["size"] += st["size"]
            else:
                types_map[st["type"]] = st
        target["node_types"] = list(types_map.values())
