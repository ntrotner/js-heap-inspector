from ....domain.models import Runtime, MatchingResult, CodeLink, CodeEvolution
from ..matching.contracts.differentiation_algorithm import MatchingAlgorithm
from ..subgraph_creation.contracts.subgraph_algorithm import SubgraphAlgorithm
from ..code_link.contracts.code_link_algorithm import CodeLinkAlgorithm


class RuntimeCausalLinkService:
    """
    Service responsible for comparing two heap runtimes and linking differences.
    
    This service implements the orchestration strategy for runtime differentiation,
    delegating the specific matching and classification logic to a pluggable algorithm.
    It follows a three-phase matching process:
    1. Exact Matching (Invariant subgraphs)
    2. Inexact Matching (Similarity-based matching for modified nodes)
    3. Residual Classification (Added/Removed nodes)
    """

    def __init__(self, differentiation_algorithm: type[MatchingAlgorithm], subgraph_algorithm: type[SubgraphAlgorithm], code_link_algorithm: type[CodeLinkAlgorithm]):
        """
        Initializes the service with a specific differentiation algorithm.
        
        Args:
            differentiation_algorithm: An implementation of MatchingAlgorithm.
            subgraph_algorithm: An implementation of SubgraphAlgorithm.
            code_link_algorithm: An implementation of CodeLinkAlgorithm.
        """
        self.differentiation_algorithm = differentiation_algorithm
        self.subgraph_algorithm = subgraph_algorithm()
        self.code_link_algorithm = code_link_algorithm

    def compare(self, baseline: Runtime, code_evolution_baseline: list[CodeEvolution], modified: Runtime, code_evolution_modified: list[CodeEvolution]) -> tuple[MatchingResult, CodeLink]:
        """
        Executes the differentiation process between baseline and modified runtimes.
        
        Args:
            baseline: The baseline Runtime domain model.
            code_evolution_baseline: The list of code evolutions for the baseline runtime.
            modified: The modified Runtime domain model.
            code_evolution_modified: The list of code evolutions for the modified runtime.
            
        Returns:
            A tuple containing a MatchingResult object and a CodeLink object.
        """
        
        subgraphs_baseline = self.subgraph_algorithm.generate(baseline)
        subgraphs_modified = self.subgraph_algorithm.generate(modified)
        instantiated_differentiation_algorithm = self.differentiation_algorithm(baseline, subgraphs_baseline, modified, subgraphs_modified)
        differentiation = instantiated_differentiation_algorithm.differentiate()
        instantiated_code_link = self.code_link_algorithm(differentiation, baseline, code_evolution_baseline, modified, code_evolution_modified)
        
        return differentiation, instantiated_code_link.link()