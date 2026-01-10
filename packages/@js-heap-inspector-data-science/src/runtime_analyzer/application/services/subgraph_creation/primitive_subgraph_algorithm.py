from typing import List
from ....domain.models import Runtime, Subgraph
from .contracts.subgraph_algorithm import SubgraphAlgorithm

class PrimitiveSubgraphAlgorithm(SubgraphAlgorithm):
    """
    Algorithm that treats each node in the runtime graph as an individual subgraph.
    """
    def generate(self, runtime: Runtime) -> List[Subgraph]:
        return [
            Subgraph(center_node_id=node.id, nodes=[node], edges=[])
            for node in runtime.nodes
        ]
