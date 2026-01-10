from abc import ABC, abstractmethod
from typing import List
from .....domain.models import Runtime, MatchingResult, Subgraph

class MatchingAlgorithm(ABC):
    """
    Abstract base class for matching algorithms.
    Implementations of this class will provide specific logic for matching,
    modifying, and identifying deltas between two heap runtimes.
    """

    def __init__(self, runtime_baseline: Runtime, subgraphs_baseline: List[Subgraph], runtime_modified: Runtime, subgraphs_modified: List[Subgraph]):
        """
        Initializes the service with a specific matching algorithm.
        
        Args:
            runtime_baseline: The baseline runtime for comparison.
            subgraphs_baseline: List of subgraphs from the baseline runtime.
            runtime_modified: The modified runtime for comparison.
            subgraphs_modified: List of subgraphs from the modified runtime.
        """
        self.runtime_baseline = runtime_baseline
        self.subgraphs_baseline = subgraphs_baseline
        self.runtime_modified = runtime_modified
        self.subgraphs_modified = subgraphs_modified
    
    @abstractmethod
    def differentiate(self) -> MatchingResult:
        """
        Analyzes two runtimes and returns the matching results.
        
        Returns:
            A MatchingResult containing matched, modified, added, and removed elements.
        """
        pass
