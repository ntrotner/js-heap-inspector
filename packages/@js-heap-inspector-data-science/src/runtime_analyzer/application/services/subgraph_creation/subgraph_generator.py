from typing import List
from ....domain.models import Runtime, Subgraph
from ....domain.exceptions import InvalidRuntimeError, UnsupportedAlgorithmError
from .primitive_subgraph_algorithm import PrimitiveSubgraphAlgorithm
from .one_hop_subgraph_algorithm import OneHopSubgraphAlgorithm

class SubgraphGeneratorService:
    """
    Service responsible for generating subgraphs from a runtime using various algorithms.
    """
    def __init__(self):
        self._algorithms = {
            "primitive": PrimitiveSubgraphAlgorithm(),
            "graph-based": OneHopSubgraphAlgorithm()
        }

    def generate(self, runtime: Runtime, algorithm_type: str) -> List[Subgraph]:
        """
        Generates subgraphs from the given runtime using the specified algorithm.
        
        Args:
            runtime: The parsed runtime graph.
            algorithm_type: The type of algorithm to use ('primitive' or 'graph-based').
            
        Returns:
            A collection of generated subgraphs.
            
        Raises:
            InvalidRuntimeError: If the runtime is empty or invalid.
            UnsupportedAlgorithmError: If the algorithm type is unknown.
        """
        if not runtime or (not runtime.nodes and not runtime.edges):
            raise InvalidRuntimeError("Runtime graph is empty or invalid.")
            
        algorithm = self._algorithms.get(algorithm_type)
        if not algorithm:
            raise UnsupportedAlgorithmError(f"Unsupported subgraph algorithm: {algorithm_type}")
            
        return algorithm.generate(runtime)
