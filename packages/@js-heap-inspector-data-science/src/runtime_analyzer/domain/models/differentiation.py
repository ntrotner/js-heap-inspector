from pydantic import BaseModel
from typing import List, Optional

class MatchSubgraphResult(BaseModel):
    """Represents a node that exists in both runtimes and has the same state or context."""
    nodes_baseline_id: List[str]
    nodes_modified_id: List[str]

class ModificationSubgraphResult(BaseModel):
    """Represents a node that exists in both runtimes but has changed state or context."""
    nodes_baseline_id: List[str]
    nodes_modified_id: List[str]
    similarity_score: Optional[float] = None

class DeltaSubgraphResult(BaseModel):
    """Represents a node that exists in only one runtime."""
    nodes_baseline_id: List[str]
    nodes_modified_id: List[str]

class MatchingResult(BaseModel):
    """The result of the differentiation process between two runtimes."""
    matched: List[MatchSubgraphResult]
    modified: List[ModificationSubgraphResult]
    added_node_ids: List[DeltaSubgraphResult]
    removed_node_ids: List[DeltaSubgraphResult]