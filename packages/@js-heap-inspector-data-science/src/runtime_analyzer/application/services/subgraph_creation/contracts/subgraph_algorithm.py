from abc import ABC, abstractmethod
from typing import List
from .....domain.models import Runtime, Subgraph

class SubgraphAlgorithm(ABC):
    """
    Abstract base class for subgraph generation algorithms.
    """
    
    @abstractmethod
    def generate(self, runtime: Runtime) -> List[Subgraph]:
        """
        Generates a collection of subgraphs from the given runtime.
        
        Args:
            runtime: The runtime to decompose into subgraphs.
            
        Returns:
            A list of Subgraph objects.
        """
        pass
