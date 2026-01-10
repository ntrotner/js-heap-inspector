from collections import deque, defaultdict
from typing import List, Dict, Set
from ....domain.models import Runtime, Subgraph, Edge
from .contracts.subgraph_algorithm import SubgraphAlgorithm

class GreedyKHopSubgraphAlgorithm(SubgraphAlgorithm):
    """
    Algorithm that partitions the heap into disjoint K-Hop clusters.
    Once a node is included in a subgraph, it is marked as covered and 
    will not initiate its own subgraph.
    
    This aligns with the 'Clustering' strategy for Large Graphs defined in 
    Figure 3.2 of the thesis.
    """

    def __init__(self, k: int = 2):
        self.k = k

    def generate(self, runtime: Runtime) -> List[Subgraph]:
        node_map = {node.id: node for node in runtime.nodes}

        # 1. Pre-map edges (Undirected graph context)
        adj: Dict[str, List[Edge]] = defaultdict(list)
        for edge in runtime.edges:
            adj[edge.fromNodeId].append(edge)
            adj[edge.toNodeId].append(edge)

        subgraphs = []
        global_visited: Set[str] = set()

        # 2. Deterministic Order
        # It is crucial to process nodes in a deterministic order so the 
        # partitions are reproducible (RS3 - Result Quality & Practicality).
        # We prioritize 'Roots' or high-degree nodes if possible, or just ID.
        sorted_nodes = sorted(runtime.nodes, key=lambda n: n.id)

        for start_node in sorted_nodes:
            # OPTIMIZATION: If node is already part of a cluster, skip it.
            if start_node.id in global_visited:
                continue

            # --- BFS for Cluster Creation ---
            # This specific subgraph's local visited set
            cluster_node_ids: Set[str] = {start_node.id}
            cluster_edges: List[Edge] = []
            seen_edge_ids: Set[int] = set()

            queue = deque([(start_node.id, 0)])

            # Mark start node as globally visited immediately
            global_visited.add(start_node.id)

            while queue:
                curr_id, dist = queue.popleft()

                if dist >= self.k:
                    continue

                for edge in adj[curr_id]:
                    neighbor_id = edge.fromNodeId if edge.toNodeId == curr_id else edge.toNodeId

                    # Add edge to this subgraph (edges can technically be shared 
                    # between clusters if they connect boundary nodes, but here we 
                    # capture them for the current cluster context).
                    if id(edge) not in seen_edge_ids:
                        seen_edge_ids.add(id(edge))
                        cluster_edges.append(edge)

                    # If neighbor is NOT globally visited, we claim it for this cluster
                    if neighbor_id not in global_visited:
                        global_visited.add(neighbor_id)
                        cluster_node_ids.add(neighbor_id)
                        queue.append((neighbor_id, dist + 1))

            # --- Assembly ---
            subgraph_nodes = [
                node_map[nid] for nid in cluster_node_ids
                if nid in node_map
            ]

            subgraphs.append(Subgraph(
                center_node_id=start_node.id,
                nodes=subgraph_nodes,
                edges=cluster_edges
            ))

        return subgraphs