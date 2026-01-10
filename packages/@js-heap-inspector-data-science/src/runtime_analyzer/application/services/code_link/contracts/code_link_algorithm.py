from abc import ABC, abstractmethod
from typing import List, Dict
from .....domain.models import MatchingResult, CodeLink, CodeEvolution

class CodeLinkAlgorithm(ABC):
    """
    Abstract base class for code link algorithms.
    """

    def __init__(self, matching_result: MatchingResult, code_changes_baseline: List[CodeEvolution], code_changes_modified: List[CodeEvolution]):
        """
        Initializes the service with a specific matching algorithm.
        
        Args:
            matching_result: The result of the matching process between the two runtimes.
            code_changes_baseline: List of code changes in the baseline runtime.
            code_changes_modified: List of code changes in the modified runtime.
        """
        self.matching_result = matching_result
        self.code_changes_baseline = code_changes_baseline
        self.code_changes_modified = code_changes_modified
    
    @abstractmethod
    def link(self) -> CodeLink:
        """
        Analyzes two runtimes and returns the matching results.
        
        Returns:
            A MatchingResult containing matched, modified, added, and removed elements.
        """
        pass
