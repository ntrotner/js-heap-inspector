import time

from ....domain.models import Runtime, MatchingResult, CodeLinkContainer, CodeEvolution
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

    def __init__(self, differentiation_algorithm: type[MatchingAlgorithm], subgraph_algorithm: type[SubgraphAlgorithm],
                 code_link_algorithm: type[CodeLinkAlgorithm], differentiation_params: dict = None,
                 subgraph_params: dict = None, code_link_params: dict = None):
        """
        Initializes the service with a specific differentiation algorithm.
        
        Args:
            differentiation_algorithm: An implementation of MatchingAlgorithm.
            subgraph_algorithm: An implementation of SubgraphAlgorithm.
            code_link_algorithm: An implementation of CodeLinkAlgorithm.
            differentiation_params: Parameters for the differentiation algorithm.
            subgraph_params: Parameters for the subgraph algorithm.
            code_link_params: Parameters for the code link algorithm.
        """
        self.differentiation_algorithm = differentiation_algorithm
        self.subgraph_algorithm = subgraph_algorithm(**(subgraph_params or {}))
        self.code_link_algorithm = code_link_algorithm
        self.differentiation_params = differentiation_params or {}
        self.code_link_params = code_link_params or {}

    def compare(self, baseline: Runtime, code_evolution_baseline: list[CodeEvolution], modified: Runtime,
                code_evolution_modified: list[CodeEvolution]) -> tuple[MatchingResult, CodeLinkContainer, dict]:
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
        time_tracking = {}

        time_tracking["subgraph_generation_start"] = time.time()
        subgraphs_baseline = self.subgraph_algorithm.generate(baseline)
        print(f"Generated subgraphs for baseline with length {subgraphs_baseline.__len__()}")

        subgraphs_modified = self.subgraph_algorithm.generate(modified)
        print(f"Generated subgraphs for modified with length {subgraphs_modified.__len__()}")
        time_tracking["subgraph_generation_end"] = time.time()

        time_tracking["differentiation_algorithm_start"] = time.time()
        instantiated_differentiation_algorithm = self.differentiation_algorithm(baseline,
                                                                                subgraphs_baseline,
                                                                                modified,
                                                                                subgraphs_modified,
                                                                                **self.differentiation_params)
        differentiation = instantiated_differentiation_algorithm.differentiate()
        print(
            f"Executed matching algorithm with following results: \n "
            f"Matched: {differentiation.matched.__len__()}\n "
            f"    Total Nodes: {sum([len(matched.nodes_baseline_id) + len(matched.nodes_modified_id) for matched in differentiation.matched])}\n"
            f"Modified: {differentiation.modified.__len__()}\n "
            f"    Total Nodes: {sum([len(modified.nodes_baseline_id) + len(modified.nodes_modified_id) for modified in differentiation.modified])}\n"
            f"Added: {differentiation.added_node_ids.__len__()}\n "
            f"    Total Nodes: {sum([len(added.nodes_baseline_id) + len(added.nodes_modified_id) for added in differentiation.added_node_ids])}\n"
            f"Removed: {differentiation.removed_node_ids.__len__()}\n"
            f"    Total Nodes: {sum([len(removed.nodes_baseline_id) + len(removed.nodes_modified_id) for removed in differentiation.removed_node_ids])}\n"
        )
        time_tracking["differentiation_algorithm_end"] = time.time()

        time_tracking["code_link_algorithm_start"] = time.time()
        instantiated_code_link = self.code_link_algorithm(differentiation, baseline, code_evolution_baseline, modified,
                                                          code_evolution_modified, **self.code_link_params)
        links = instantiated_code_link.link()
        print(
            "Executed code link algorithm with following results: \n"
            f"Regressions: {links.regressions.__len__()}\n"
            f"Improvements: {links.improvements.__len__()}\n"
            f"Unmappable Regressions: {links.unmappable_regressions.__len__()}\n"
            f"Unmappable Improvements: {links.unmappable_improvements.__len__()}\n"
        )
        time_tracking["code_link_algorithm_end"] = time.time()

        return differentiation, links, time_tracking
