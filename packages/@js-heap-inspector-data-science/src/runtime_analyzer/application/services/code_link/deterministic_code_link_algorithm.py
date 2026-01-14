from typing import List, Dict, Optional
from .contracts.code_link_algorithm import CodeLinkAlgorithm
from ....domain.models import Stack, Node, Edge, CodeEvolution, CodeLinkContainer, CausalPair


class DeterministicLinkage(CodeLinkAlgorithm):
    """
    Implements the deterministic linkage strategy defined in Thesis Section 3.3.2.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.bl_stack_map = {s.id: s for s in self.runtime_baseline.stacks}
        self.mod_stack_map = {s.id: s for s in self.runtime_modified.stacks}

        self.bl_node_map = {n.id: n for n in self.runtime_baseline.nodes}
        self.mod_node_map = {n.id: n for n in self.runtime_modified.nodes}

        # Build reverse edge maps for retainer search (Phase 2)
        self.mod_reverse_edges = self._build_reverse_edges(self.runtime_modified.edges)

        # Pre-filter code changes into contexts
        self.context_regression = [
            c for c in self.code_changes_modified
            if c.modificationSource == 'modified'
        ]
        self.context_improvement = [
            c for c in self.code_changes_baseline
            if c.modificationSource == 'base'
        ]

    def _build_reverse_edges(self, edges: List[Edge]) -> Dict[str, List[str]]:
        """Maps toNodeId -> list of fromNodeIds."""
        rev = {}
        for edge in edges:
            if edge.toNodeId not in rev:
                rev[edge.toNodeId] = []
            rev[edge.toNodeId].append(edge.fromNodeId)
        return rev

    def link(self) -> CodeLinkContainer:
        regressions: List[CausalPair] = []
        improvements: List[CausalPair] = []

        # --- Phase 1: Direct Linkage ---

        # 1. Analyze Added Nodes (Regressions)
        # Input: S_delta (added) and S_modified
        unmapped_regression_nodes: List[str] = []

        # Collect all modified/added node IDs from the Modified Runtime
        target_mod_ids = []
        for res in self.matching_result.added_node_ids:
            target_mod_ids.extend(res.nodes_modified_id)
        for res in self.matching_result.modified:
            target_mod_ids.extend(res.nodes_modified_id)

        for node_id in target_mod_ids:
            node = self.mod_node_map.get(node_id)
            if not node:
                continue

            link = self._sl_verify(node, self.context_regression, self.mod_stack_map)
            if link:
                regressions.append(CausalPair(node_id=node.id, code_evolution=link, confidence='Direct'))
            else:
                unmapped_regression_nodes.append(node.id)

        # 2. Analyze Removed Nodes (Improvements)
        # Input: S_delta (removed) from Baseline Runtime
        for res in self.matching_result.removed_node_ids:
            for node_id in res.nodes_baseline_id:
                node = self.bl_node_map.get(node_id)
                if not node:
                    continue

                link = self._sl_verify(node, self.context_improvement, self.bl_stack_map)
                if link:
                    improvements.append(CausalPair(node_id=node.id, code_evolution=link, confidence='Direct'))

        # --- Phase 2: Derived Linkage (Retainer Search)  ---

        # Only applied to regressions (Modified Runtime) where Direct Link failed.
        # Search Zone 1 & 2 for causal retainers.
        for node_id in unmapped_regression_nodes:
            derived_link = self._find_causal_retainer(node_id, regressions)
            if derived_link:
                regressions.append(CausalPair(node_id=node_id, code_evolution=derived_link, confidence='Derived'))

        return CodeLinkContainer(regressions=regressions, improvements=improvements)

    def _sl_verify(self, node: Node, code_changes: List[CodeEvolution], stack_map: Dict[str, Stack]) -> Optional[
        CodeEvolution]:
        """
        Implementation of equation 3.35: SL_verify(S, E).
        Checks if the allocation trace intersects with code change coordinates.
        """
        if not node.traceId:
            return None

        # Start with the allocation site
        current_stack_id = node.traceId

        # Traverse the stack trace (conceptually S = f0...fn)
        # We process a queue of stack IDs if the model allows walking parents via frameIds
        # Assuming frameIds contains the IDs of frames in the call chain.

        trace_stack = [current_stack_id]

        # If the Stack object is a container for frames, we expand it. 
        # If it is a frame itself with parent pointers, we traverse.
        # Based on typical V8 models: trace_node_id points to a node in the stack tree.

        while trace_stack:
            sid = trace_stack.pop(0)
            stack_frame = stack_map.get(sid)
            if not stack_frame:
                continue

            # Check intersection
            for change in code_changes:
                if self._check_intersection(stack_frame, change):
                    return change

            # Propagate up the stack (Assuming frameIds are parent/callers)
            # If frameIds is empty, we stop (root).
            for parent_id in stack_frame.frameIds:
                if parent_id in stack_map:
                    trace_stack.append(parent_id)

        return None

    def _check_intersection(self, frame: Stack, change: CodeEvolution) -> bool:
        """
        Verifies if stack frame location falls within the CodeEvolution span.
        Logic: (f.Lsrc == mu.id_file) AND (f.Pcode in mu.CS).
        """
        # 1. Check File Match
        # Note: In production, rigorous path normalization/fuzzy matching is needed here.
        if change.fileId not in frame.scriptName:
            return False

        # 2. Check Coordinate Span
        # Simple bounding box check for lines
        if (frame.lineNumber >= change.codeChangeSpan.lineStart and
                frame.lineNumber <= change.codeChangeSpan.lineEnd):
            return True

        return False

    def _find_causal_retainer(self, node_id: str, established_links: List[CausalPair]) -> Optional[CodeEvolution]:
        """
        Phase 2: Traverses graph topology to find a retainer linked to a code change.
        Search Space: Zone 1 (Intra-Subgraph) + Zone 2 (Neighborhood).
        """
        link_map = {pair.node_id: pair.code_evolution for pair in established_links}

        # BFS Queue: (current_node_id, distance)
        queue = [(node_id, 0)]
        visited = {node_id}
        max_distance = 10  # K-Hop limit (Zone 2)

        while queue:
            curr, dist = queue.pop(0)

            # If this retainer is already causally linked, inherit the cause
            if curr in link_map:
                return link_map[curr]

            if dist >= max_distance:
                continue

            # Get retainers (Reverse edges)
            retainers = self.mod_reverse_edges.get(curr, [])
            for ret_id in retainers:
                if ret_id not in visited:
                    visited.add(ret_id)
                    queue.append((ret_id, dist + 1))

        return None
