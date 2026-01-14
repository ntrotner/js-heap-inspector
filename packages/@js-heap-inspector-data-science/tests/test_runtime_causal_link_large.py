import json
from runtime_analyzer.application.services.runtime_parser.runtime_parser import RuntimeParserService
from runtime_analyzer.application.services.runtime_causal_link.runtime_causal_link import RuntimeCausalLinkService
from runtime_analyzer.application.services.matching.heuristic_matching_algorithm import HeuristicMatchingAlgorithm
from runtime_analyzer.application.services.subgraph_creation.greedy_k_hop_subgraph_algorithm import GreedyKHopSubgraphAlgorithm
from runtime_analyzer.application.services.code_link.deterministic_code_link_algorithm import DeterministicLinkage
from runtime_analyzer.domain.models import CodeEvolution, CodeChangeSpan

def generate_large_runtime(node_count=30, modified=False):
    nodes = []
    edges = []
    stacks = []
    
    # Root node
    nodes.append({"id": "root", "edgeIds": ["e0"], "type": "root", "root": True})
    
    # Create a chain of nodes
    for i in range(1, node_count + 1):
        node_id = f"n{i}"
        edge_id = f"e{i}"
        
        # Stack trace for each node
        stack_id = f"s{i}"
        stacks.append({
            "id": stack_id,
            "frameIds": [],
            "functionName": f"func{i}",
            "scriptName": "app.js",
            "lineNumber": i * 10,
            "columnNumber": 1
        })
        
        value = f"value_{i}"
        if modified and i == 10:
            value = "modified_value_10"
            
        nodes.append({
            "id": node_id,
            "edgeIds": [f"e{i+1}"] if i < node_count else [],
            "type": "object",
            "value": value,
            "traceId": stack_id
        })
        
        if i == 1:
            edges.append({"id": "e0", "fromNodeId": "root", "toNodeId": "n1", "name": "start"})
        
        if i < node_count:
            edges.append({"id": f"e{i}", "fromNodeId": f"n{i}", "toNodeId": f"n{i+1}", "name": "next"})

    if modified:
        # Add a new node
        new_node_id = f"n{node_count + 1}"
        new_stack_id = f"s{node_count + 1}"
        stacks.append({
            "id": new_stack_id,
            "frameIds": [],
            "functionName": "new_func",
            "scriptName": "app.js",
            "lineNumber": (node_count + 1) * 10,
            "columnNumber": 1
        })
        nodes.append({
            "id": new_node_id,
            "edgeIds": [],
            "type": "object",
            "value": "added_value",
            "traceId": new_stack_id
        })
        # Connect it to n15
        edges.append({"id": f"e_added", "fromNodeId": "n15", "toNodeId": new_node_id, "name": "added_ref"})
        # Update n15's edgeIds in the list (though the parser might not strictly check it if it uses the edges list)
        for n in nodes:
            if n["id"] == "n15":
                n["edgeIds"].append("e_added")
        
        # Remove last node of the original chain
        nodes = [n for n in nodes if n["id"] != f"n{node_count}"]
        edges = [e for e in edges if e["toNodeId"] != f"n{node_count}" and e["fromNodeId"] != f"n{node_count}"]

    return {
        "nodes": nodes,
        "edges": edges,
        "stacks": stacks
    }

def test_runtime_causal_link_large_graph():
    parser = RuntimeParserService()
    
    baseline_raw = generate_large_runtime(node_count=50, modified=False)
    modified_raw = generate_large_runtime(node_count=50, modified=True)
    
    baseline_runtime = parser.parse(json.dumps(baseline_raw))
    modified_runtime = parser.parse(json.dumps(modified_raw))
    
    # Code evolutions
    # ce1 covers n10 change (line 100)
    ce1 = CodeEvolution(
        fileId="app.js",
        modificationType="modify",
        modificationSource="base",
        codeChangeSpan=CodeChangeSpan(lineStart=95, lineEnd=105, columnStart=0, columnEnd=100)
    )
    
    # ce2 covers n51 addition (line 510)
    ce2 = CodeEvolution(
        fileId="app.js",
        modificationType="insert",
        modificationSource="modified",
        codeChangeSpan=CodeChangeSpan(lineStart=505, lineEnd=515, columnStart=0, columnEnd=100)
    )
    
    ce_baseline = [ce1]
    ce_modified = [ce2]
    
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
    
    # Verify we have more than 25 nodes
    assert len(baseline_runtime.nodes) >= 30
    assert len(modified_runtime.nodes) >= 30
    
    # n10 should be in modified subgraphs
    modified_node_ids = []
    for m in matching_result.modified:
        modified_node_ids.extend(m.nodes_modified_id)
    assert "n10" in modified_node_ids
    
    # n51 should be in added or modified (reachable from n15)
    added_node_ids = []
    for a in matching_result.added_node_ids:
        added_node_ids.extend(a.nodes_modified_id)
    assert "n51" in added_node_ids or "n51" in modified_node_ids
    
    # n50 should be in removed or in a modified subgraph's baseline nodes
    removed_node_ids = []
    for r in matching_result.removed_node_ids:
        removed_node_ids.extend(r.nodes_baseline_id)
    
    modified_baseline_node_ids = []
    for m in matching_result.modified:
        modified_baseline_node_ids.extend(m.nodes_baseline_id)
        
    assert "n50" in removed_node_ids or "n50" in modified_baseline_node_ids
    
    # If it is in modified_baseline_node_ids, it should NOT be in modified_node_ids (the modified side)
    if "n50" in modified_baseline_node_ids:
        all_modified_side_node_ids = []
        for m in matching_result.modified:
            all_modified_side_node_ids.extend(m.nodes_modified_id)
        for a in matching_result.added_node_ids:
            all_modified_side_node_ids.extend(a.nodes_modified_id)
        assert "n50" not in all_modified_side_node_ids
    
    # Verify code link
    # n51 should be linked to ce2 as regression
    regression_node_ids = [p.node_id for p in code_link.regressions]
    assert "n51" in regression_node_ids
