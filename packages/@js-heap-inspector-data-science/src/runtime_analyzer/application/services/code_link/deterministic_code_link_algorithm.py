from typing import List, Dict, Optional
from collections import deque
from .contracts.code_link_algorithm import CodeLinkAlgorithm
from ....domain.models import Stack, Node, Edge, CodeEvolution, CodeLinkContainer, CausalPair


class DeterministicLinkage(CodeLinkAlgorithm):
    """
    Implements the deterministic linkage strategy defined in Thesis Section 3.3.2.
    """

    def __init__(self, *args, max_distance: int = 10, **kwargs):
        super().__init__(*args, **kwargs)
        self.max_distance = max_distance
        self.bl_stack_map = {s.id: s for s in self.runtime_baseline.stacks}
        self.mod_stack_map = {s.id: s for s in self.runtime_modified.stacks}

        self.bl_node_map = {n.id: n for n in self.runtime_baseline.nodes}
        self.mod_node_map = {n.id: n for n in self.runtime_modified.nodes}

        # Build reverse edge maps for retainer search (Phase 2)
        self.mod_reverse_edges = self._build_reverse_edges(self.runtime_modified.edges)
        self.bl_reverse_edges = self._build_reverse_edges(self.runtime_baseline.edges)

        # Pre-filter code changes into contexts
        self.context_regression = [
            c for c in self.code_changes_modified
            if c.modificationSource == 'modified'
        ]
        self.context_improvement = [
            c for c in self.code_changes_baseline
            if c.modificationSource == 'base'
        ]

        # Optimization Caches
        self._frame_match_cache = {}  # (id(code_changes), sid) -> CodeEvolution
        self._trace_result_cache = {}  # (id(code_changes), trace_id) -> CodeEvolution
        self._grouped_changes_cache = {} # id(code_changes) -> List[Tuple[fileId, List[CodeEvolution]]]

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
        unmappable_regressions: List[str] = []
        unmappable_improvements: List[str] = []

        # --- Phase 1: Direct Linkage ---
        print("Starting Phase 1: Direct Linkage")
        # 1. Analyze Added Nodes (Regressions)
        # Input: S_delta (added) and S_modified
        unmapped_regression_nodes: List[str] = []
        unmapped_improvement_nodes: List[str] = []

        # Collect all modified/added node IDs from the Modified Runtime
        target_mod_ids = []
        for res in self.matching_result.added_node_ids:
            target_mod_ids.extend(res.nodes_modified_id)
        for res in self.matching_result.modified:
            target_mod_ids.extend(res.nodes_modified_id)

        for index, node_id in enumerate(target_mod_ids):
            if index % 500 == 0:
                print(f"Direct Linkage Modified/Added from Modified Phase 1 Status: {(index/len(target_mod_ids))*100:.2f}%")
            node = self.mod_node_map.get(node_id)
            if not node:
                continue

            link = self._sl_verify(node, self.context_regression, self.mod_stack_map)
            if link:
                regressions.append(CausalPair(node_id=node.id, code_evolution=link, confidence='Direct'))
            else:
                unmapped_regression_nodes.append(node.id)


        target_bl_ids = []
        for res in self.matching_result.removed_node_ids:
            target_bl_ids.extend(res.nodes_baseline_id)
        for res in self.matching_result.modified:
            target_bl_ids.extend(res.nodes_baseline_id)
        
        # 2. Analyze modified and removed nodes from Baseline Runtime (Improvements)
        # Input: S_modified and S_baseline
        for index, node_id in enumerate(target_bl_ids):
            if index % 500 == 0:
                print(f"Direct Linkage Modified/Removed from Baseline Phase 1 Status: {(index/len(target_bl_ids))*100:.2f}%")
            node = self.bl_node_map.get(node_id)
            if not node:
                continue
                
            link = self._sl_verify(node, self.context_improvement, self.bl_stack_map)
            if link:
                improvements.append(CausalPair(node_id=node.id, code_evolution=link, confidence='Direct'))
            else:
                unmapped_improvement_nodes.append(node.id)

        # --- Phase 2: Derived Linkage (Retainer Search)  ---
        print("Starting Phase 2: Derived Linkage")

        # Build initial link maps for Phase 2 for O(1) lookups
        regression_link_map = {pair.node_id: pair.code_evolution for pair in regressions}
        improvement_link_map = {pair.node_id: pair.code_evolution for pair in improvements}

        # Only applied to regressions (Modified Runtime) where Direct Link failed.
        # Search Zone 1 & 2 for causal retainers.
        for index, node_id in enumerate(unmapped_regression_nodes):
            if index % 500 == 0:
                print(f"Derived Linkage for Modified Phase 2 Status: {(index/len(unmapped_regression_nodes))*100:.2f}%")
            derived_link = self._find_causal_retainer(self.mod_node_map, self.context_regression, self.mod_stack_map, node_id, regression_link_map, self.mod_reverse_edges)
            if derived_link:
                regressions.append(CausalPair(node_id=node_id, code_evolution=derived_link, confidence='Derived'))
                regression_link_map[node_id] = derived_link
            else:
                unmappable_regressions.append(node_id)

        for index, node_in in enumerate(unmapped_improvement_nodes):
            if index % 500 == 0:
                print(f"Derived Linkage for Baseline Phase 2 Status: {(index/len(unmapped_improvement_nodes))*100:.2f}%")
            derived_link = self._find_causal_retainer(self.bl_node_map, self.context_improvement, self.bl_stack_map, node_in, improvement_link_map, self.bl_reverse_edges)
            if derived_link:
                improvements.append(CausalPair(node_id=node_in, code_evolution=derived_link, confidence='Derived'))
                improvement_link_map[node_in] = derived_link
            else:
                unmappable_improvements.append(node_in)

        return CodeLinkContainer(regressions=regressions, improvements=improvements, unmappable_regressions=unmappable_regressions, unmappable_improvements=unmappable_improvements)

    def _sl_verify(self, node: Node, code_changes: List[CodeEvolution], stack_map: Dict[str, Stack]) -> Optional[
        CodeEvolution]:
        """
        Implementation of equation 3.35: SL_verify(S, E).
        Checks if the allocation trace intersects with code change coordinates.
        """
        if not node.traceId:
            return None

        # Optimization: Check if we have already processed this traceId for these code_changes and stack_map
        cache_key = (id(code_changes), id(stack_map), node.traceId)
        if cache_key in self._trace_result_cache:
            return self._trace_result_cache[cache_key]

        # Start with the allocation site
        current_stack_id = node.traceId
        trace_stack = deque([current_stack_id])
        visited = {current_stack_id}

        result = None
        while trace_stack:
            sid = trace_stack.popleft()

            # Check intersection for this frame (using cache)
            match = self._get_frame_match(sid, code_changes, stack_map)
            if match:
                result = match
                break

            stack_frame = stack_map.get(sid)
            if not stack_frame:
                continue

            # Propagate up the stack (Assuming frameIds are parent/callers)
            for parent_id in stack_frame.frameIds:
                if parent_id in stack_map and parent_id not in visited:
                    visited.add(parent_id)
                    trace_stack.append(parent_id)

        self._trace_result_cache[cache_key] = result
        return result

    def _get_frame_match(self, sid: str, code_changes: List[CodeEvolution], stack_map: Dict[str, Stack]) -> Optional[CodeEvolution]:
        """Checks if a single stack frame matches any code change, with caching and file-based pre-filtering."""
        cache_key = (id(code_changes), id(stack_map), sid)
        if cache_key in self._frame_match_cache:
            return self._frame_match_cache[cache_key]

        frame = stack_map.get(sid)
        if not frame:
            self._frame_match_cache[cache_key] = None
            return None

        # Build grouped changes for this list if not already cached
        if id(code_changes) not in self._grouped_changes_cache:
            file_to_changes = {}
            file_order = []
            for c in code_changes:
                if c.fileId not in file_to_changes:
                    file_to_changes[c.fileId] = []
                    file_order.append(c.fileId)
                file_to_changes[c.fileId].append(c)
            self._grouped_changes_cache[id(code_changes)] = [(fid, file_to_changes[fid]) for fid in file_order]

        grouped = self._grouped_changes_cache[id(code_changes)]

        match = None
        for fileId, changes in grouped:
            if fileId in frame.scriptName:
                for change in changes:
                    if change.codeChangeSpan.lineStart <= frame.lineNumber <= change.codeChangeSpan.lineEnd:
                        match = change
                        break
            if match:
                break

        self._frame_match_cache[cache_key] = match
        return match

    def _find_causal_retainer(self, node_map: Dict[str, Node], code_changes: list[CodeEvolution], stack_map: dict[str, Stack], node_id: str, link_map: Dict[str, CodeEvolution], reverse_edges: Dict[str, List[str]]) -> Optional[CodeEvolution]:
        """
        Phase 2: Traverses graph topology to find a retainer linked to a code change.
        Search Space: Zone 1 (Intra-Subgraph) + Zone 2 (Neighborhood).
        Optimized with deque and pre-built link_map.
        """
        # BFS Queue: (current_node_id, distance)
        queue = deque([(node_id, 0)])
        visited = {node_id}

        while queue:
            curr, dist = queue.popleft()

            # If this retainer is already causally linked, inherit the cause
            if curr in link_map:
                return link_map[curr]

            # If the retainer is not linked, check the stack trace of that retainer if it matches with any of the changes
            link = self._sl_verify(node_map.get(curr), code_changes, stack_map)
            if link:
                link_map[curr] = link
                return link

            if dist >= self.max_distance:
                continue

            # Get retainers (Reverse edges)
            retainers = reverse_edges.get(curr, [])
            for ret_id in retainers:
                if ret_id not in visited:
                    visited.add(ret_id)
                    queue.append((ret_id, dist + 1))

        return None
