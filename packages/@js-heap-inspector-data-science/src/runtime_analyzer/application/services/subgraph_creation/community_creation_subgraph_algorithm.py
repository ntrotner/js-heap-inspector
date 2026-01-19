import networkx as nx
from typing import List, Dict
from ....domain.models import Runtime, Subgraph, Edge
from .contracts.subgraph_algorithm import SubgraphAlgorithm

class CommunityDetectionSubgraphAlgorithm(SubgraphAlgorithm):
    """
    Algorithm that partitions the heap into disjoint communities using 
    Modularity-based clustering (Louvain method).
    
    This aligns with the 'Clustering' strategy in Figure 3.2 for large graphs,
    automatically identifying dense topological structures. 
    """

    def __init__(self, resolution: float = 1.0, seed: int = 1):
        """
        Args:
            resolution: Controls the size of communities. 
                        Higher values (>1) lead to smaller, more numerous communities.
                        Lower values (<1) lead to fewer, larger communities.
            seed: Random seed for reproducibility.
        """
        self.resolution = resolution
        self.seed = seed

    def generate(self, runtime: Runtime) -> List[Subgraph]:
        if not runtime.nodes:
            return []

        G = nx.Graph()

        for node in runtime.nodes:
            G.add_node(node.id, data=node)

        edge_lookup: Dict[str, Edge] = {}
        for edge in runtime.edges:
            G.add_edge(edge.fromNodeId, edge.toNodeId)
            # Create a unique key for undirected edge lookup
            # (Sort IDs to ensure consistency A->B vs B->A)
            u, v = sorted((edge.fromNodeId, edge.toNodeId))
            edge_lookup[f"{u}-{v}"] = edge

        # detect communities
        communities = nx.community.louvain_communities(
            G,
            weight=None,
            resolution=self.resolution,
            seed=self.seed
        )

        subgraphs = []
        for community_ids in communities:
            member_ids = list(community_ids)

            # retrieve node objects
            cluster_nodes = [G.nodes[nid]['data'] for nid in member_ids]
            cluster_edges = []

            induced_subgraph = G.subgraph(member_ids)
            for u, v in induced_subgraph.edges():
                u_sorted, v_sorted = sorted((u, v))
                lookup_key = f"{u_sorted}-{v_sorted}"
                if lookup_key in edge_lookup:
                    cluster_edges.append(edge_lookup[lookup_key])

            # select center node
            # For communities, the most "central" node is usually the one with 
            # the highest degree (most connections) within the cluster.
            # This acts as the "Representative" for the group.
            if member_ids:
                degrees = dict(induced_subgraph.degree())
                center_node_id = max(degrees, key=degrees.get)
            else:
                # Fallback for singletons
                center_node_id = member_ids[0]

            subgraphs.append(Subgraph(
                center_node_id=center_node_id,
                nodes=cluster_nodes,
                edges=cluster_edges
            ))

        return subgraphs
