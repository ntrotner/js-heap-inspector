from typing import List, Dict, Set
from ....domain.models import Runtime, Subgraph, Edge
from .contracts.subgraph_algorithm import SubgraphAlgorithm

class OneHopSubgraphAlgorithm(SubgraphAlgorithm):
    """
    Algorithm that generates subgraphs based on a node's 1-hop neighborhood.
    Each subgraph contains the central node and all its directly connected edges and nodes.
    """
    def generate(self, runtime: Runtime) -> List[Subgraph]:
        node_map = {node.id: node for node in runtime.nodes}
        
        # Pre-map edges to nodes for faster lookup
        # We consider both incoming and outgoing edges for "directly connected"
        node_to_edges: Dict[str, List[Edge]] = {}
        for edge in runtime.edges:
            node_to_edges.setdefault(edge.fromNodeId, []).append(edge)
            node_to_edges.setdefault(edge.toNodeId, []).append(edge)
            
        subgraphs = []
        for node in runtime.nodes:
            connected_edges = node_to_edges.get(node.id, [])
            
            # Identify all nodes connected via these edges
            neighbor_node_ids: Set[str] = {node.id}
            for edge in connected_edges:
                neighbor_node_ids.add(edge.fromNodeId)
                neighbor_node_ids.add(edge.toNodeId)
            
            # Filter and collect node objects
            subgraph_nodes = [node_map[nid] for nid in neighbor_node_ids if nid in node_map]
            
            subgraphs.append(Subgraph(
                center_node_id=node.id,
                nodes=subgraph_nodes,
                edges=connected_edges
            ))
            
        return subgraphs
