from abc import ABC, abstractmethod
from typing import List
from .....domain.models import MatchingResult, CodeLinkContainer, CodeEvolution, Runtime

class CodeLinkAlgorithm(ABC):
    """
    Abstract base class for code link algorithms.
    """

    def __init__(self, matching_result: MatchingResult, runtime_baseline: Runtime, code_changes_baseline: List[CodeEvolution], runtime_modified: Runtime, code_changes_modified: List[CodeEvolution], **kwargs):
        """
        Initializes the service with a specific matching algorithm.
        
        Args:
            matching_result: The result of the matching process between the two runtimes.
            runtime_baseline: The baseline runtime for comparison.
            code_changes_baseline: List of code changes in the baseline runtime.
            runtime_modified: The modified runtime for comparison.
            code_changes_modified: List of code changes in the modified runtime.
        """
        self.matching_result = matching_result
        self.runtime_baseline = runtime_baseline
        self.code_changes_baseline = code_changes_baseline
        self.runtime_modified = runtime_modified
        self.code_changes_modified = code_changes_modified
    
    @abstractmethod
    def link(self) -> CodeLinkContainer:
        """
        Analyzes two runtimes and returns the matching results.
        
        Returns:
            A MatchingResult containing matched, modified, added, and removed elements.
        """
        pass
