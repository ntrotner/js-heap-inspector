from typing import Set, List
from ....domain.models import Runtime, MatchingResult, Subgraph, MatchSubgraphResult, ModificationSubgraphResult, DeltaSubgraphResult, Node
from .contracts.differentiation_algorithm import MatchingAlgorithm


# --- User Provided Models (Included for context) ---
# [Insert your Pydantic models here: MatchSubgraphResult, ModificationSubgraphResult, 
# DeltaSubgraphResult, MatchingResult, Subgraph, Node, Runtime, MatchingAlgorithm]

class HeuristicMatchingAlgorithm(MatchingAlgorithm):
    """
    Implements the Heuristic-Based Graph Differentiation described in 
    Section 3.2.4 of the thesis.
    
    Phases:
    1. Exact Matching: Identifies invariant structures.
    2. Inexact Matching: Identifies modified nodes via distance heuristic.
    3. Residual Classification: Identifies added and removed nodes.
    """

    def __init__(self,
                 runtime_baseline: Runtime,
                 subgraphs_baseline: List[Subgraph],
                 runtime_modified: Runtime,
                 subgraphs_modified: List[Subgraph],
                 similarity_threshold: float = 0.5):
        super().__init__(runtime_baseline, subgraphs_baseline, runtime_modified, subgraphs_modified)
        self.threshold = similarity_threshold  # Corresponds to delta in Eq 3.11

    def differentiate(self) -> MatchingResult:
        # Sets to keep track of matched IDs to ensure exclusivity
        matched_baseline_ids: Set[str] = set()
        matched_modified_ids: Set[str] = set()

        matched_results: List[MatchSubgraphResult] = []
        modified_results: List[ModificationSubgraphResult] = []
        added_results: List[DeltaSubgraphResult] = []
        removed_results: List[DeltaSubgraphResult] = []

        # --- Phase 1: Exact Matching (Thesis Eq 3.8) ---
        # "A pair corresponds if Si from R_modified is structurally and 
        # attributively identical to Sj' from R_baseline."

        # Index baseline subgraphs for faster lookup (optimization)
        # In a real implementation, hashing complex objects might require specific __hash__ methods
        # Here we use a nested loop for clarity of the algorithm

        for mod_sg in self.subgraphs_modified:
            best_exact_match = None

            for base_sg in self.subgraphs_baseline:
                if base_sg.center_node_id in matched_baseline_ids:
                    continue

                if self._are_subgraphs_identical(mod_sg, base_sg):
                    best_exact_match = base_sg
                    break

            if best_exact_match:
                matched_baseline_ids.add(best_exact_match.center_node_id)
                matched_modified_ids.add(mod_sg.center_node_id)
                matched_results.append(MatchSubgraphResult(
                    nodes_baseline_id=[n.id for n in best_exact_match.nodes],
                    nodes_modified_id=[n.id for n in mod_sg.nodes]
                ))

        # --- Phase 2: Inexact Matching (Thesis Eq 3.11) ---
        # "The second phase applies bidirectional inexact matching... minimizing 
        # semantic and structural distance dist(Si, Sj')"

        # Prepare sets U_mod and U_base (Unmatched subgraphs)
        unmatched_modified = [sg for sg in self.subgraphs_modified
                              if sg.center_node_id not in matched_modified_ids]
        unmatched_baseline = [sg for sg in self.subgraphs_baseline
                              if sg.center_node_id not in matched_baseline_ids]

        # Calculate pairwise distances
        candidates = []
        for mod_sg in unmatched_modified:
            for base_sg in unmatched_baseline:
                dist = self._calculate_distance(mod_sg, base_sg)
                if dist < self.threshold:
                    # Score is inverse of distance for similarity
                    similarity = 1.0 - dist
                    candidates.append((dist, mod_sg, base_sg, similarity))

        # Sort by lowest distance (Greedy approach for "argmin")
        candidates.sort(key=lambda x: x[0])

        for dist, mod_sg, base_sg, similarity in candidates:
            # Check if either is already taken in this phase
            if (mod_sg.center_node_id in matched_modified_ids or
                    base_sg.center_node_id in matched_baseline_ids):
                continue

            # Register match
            matched_modified_ids.add(mod_sg.center_node_id)
            matched_baseline_ids.add(base_sg.center_node_id)

            modified_results.append(ModificationSubgraphResult(
                nodes_baseline_id=[n.id for n in base_sg.nodes],
                nodes_modified_id=[n.id for n in mod_sg.nodes],
                similarity_score=similarity
            ))

        # --- Phase 3: Residual Classification (Thesis Eq 3.13 - 3.15) ---
        # "Any subgraph that cannot be matched exactly or inexactly... is determined to be disjoint."

        # Identify Added (S_added)
        for mod_sg in self.subgraphs_modified:
            if mod_sg.center_node_id not in matched_modified_ids:
                added_results.append(DeltaSubgraphResult(
                    nodes_baseline_id=[], # No baseline counterpart
                    nodes_modified_id=[n.id for n in mod_sg.nodes]
                ))

        # Identify Removed (S_removed)
        for base_sg in self.subgraphs_baseline:
            if base_sg.center_node_id not in matched_baseline_ids:
                removed_results.append(DeltaSubgraphResult(
                    nodes_baseline_id=[n.id for n in base_sg.nodes],
                    nodes_modified_id=[] # No modified counterpart
                ))

        return MatchingResult(
            matched=matched_results,
            modified=modified_results,
            added_node_ids=added_results,
            removed_node_ids=removed_results
        )

    def _are_subgraphs_identical(self, sg1: Subgraph, sg2: Subgraph) -> bool:
        """
        Checks for topological and semantic identity (Exact Match).
        This implements the condition Si == Sj' from Eq 3.8.
        Note: ID is abstracted; we check content, not memory address.
        """
        # 1. Quick check: Node counts and Edge counts
        if len(sg1.nodes) != len(sg2.nodes) or len(sg1.edges) != len(sg2.edges):
            return False

        # 2. Deep Topology Check 
        # For strict exact matching, the entire set of nodes/edges must match.
        # This simplifies graph isomorphism by assuming tiered attributes are consistent.
        # Implementation assumes nodes lists are sorted or we use sets of signatures.
        sg1_sigs = sorted([self._get_node_signature(n) for n in sg1.nodes])
        sg2_sigs = sorted([self._get_node_signature(n) for n in sg2.nodes])

        return sg1_sigs == sg2_sigs

    def _calculate_distance(self, sg1: Subgraph, sg2: Subgraph) -> float:
        """
        Calculates distance between two subgraphs.
        Returns a float between 0.0 (identical) and 1.0 (completely different).
        """
        # Heuristic weights defined by domain knowledge
        # (e.g. Type mismatch is more severe than Value mismatch)
        W_TYPE = 0.5
        W_VALUE = 0.3
        W_TOPOLOGY = 0.2

        center1 = next(n for n in sg1.nodes if n.id == sg1.center_node_id)
        center2 = next(n for n in sg2.nodes if n.id == sg2.center_node_id)

        # 1. Semantic Distance (Center Node)
        dist_type = 1.0 if center1.type != center2.type else 0.0

        dist_value = 0.0
        if center1.value != center2.value:
            dist_value = 1.0
            # Could implement Levenshtein distance for strings here if needed

        # 2. Structural/Topological Distance
        # Simple heuristic: Jaccard distance of node types in the subgraph neighborhood
        types1 = set([n.type for n in sg1.nodes])
        types2 = set([n.type for n in sg2.nodes])

        intersection = len(types1.intersection(types2))
        union = len(types1.union(types2))

        dist_topology = 1.0 - (intersection / union) if union > 0 else 1.0

        total_dist = (dist_type * W_TYPE) + (dist_value * W_VALUE) + (dist_topology * W_TOPOLOGY)
        return total_dist

    def _are_nodes_semantically_equal(self, n1: Node, n2: Node) -> bool:
        """Checks if two nodes are identical in Type, Value, and Root status."""
        return (n1.type == n2.type and
                n1.value == n2.value and
                n1.root == n2.root)

    def _get_node_signature(self, node: Node) -> str:
        """Generates a signature string for exact set comparison."""
        # Using a tuple string representation for hashing/sorting
        return f"{node.type}:{node.value}:{node.root}"