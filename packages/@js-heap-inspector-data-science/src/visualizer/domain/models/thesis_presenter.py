from typing import List, Dict, Optional, Union, Any
from pydantic import BaseModel, Field


# --- Shared Models ---

class NodeTypeMetrics(BaseModel):
    type: str
    count: int
    size: int
    write_count: int
    read_count: int


class SummaryMetrics(BaseModel):
    nodes: int
    edges: Optional[int] = None
    stacks: Optional[int] = None
    read_counter: int
    write_counter: int
    read_size: int
    write_size: int
    node_types: Optional[List[NodeTypeMetrics]] = None


# --- Input Section ---

class SubgraphParameters(BaseModel):
    resolution: Optional[float] = None
    k: Optional[int] = None
    seed: Optional[int] = None


class MatchingParameters(BaseModel):
    similarity_threshold: float
    w_type: float
    w_value: float
    w_topology: float


class CodeLinkParameters(BaseModel):
    max_distance: int


class Parameters(BaseModel):
    subgraph: SubgraphParameters
    matching: Optional[MatchingParameters] = None
    code_link: Optional[CodeLinkParameters] = None


class CodeLinkInput(BaseModel):
    distance: int


class InputSection(BaseModel):
    strategy: str
    parameters: Parameters
    code_link: CodeLinkInput
    baseline: SummaryMetrics
    modified: SummaryMetrics


# --- Output Section ---

class TimeTracking(BaseModel):
    subgraph_generation_start: float
    subgraph_generation_end: float
    differentiation_algorithm_start: float
    differentiation_algorithm_end: float
    code_link_algorithm_start: float
    code_link_algorithm_end: float


class SubgraphOutput(BaseModel):
    baseline: int
    modified: int


class DistanceMetrics(BaseModel):
    distance: int
    metrics: SummaryMetrics


class DerivedMetrics(BaseModel):
    distances: Dict[str, DistanceMetrics] # Can be empty list or dict of distances


class FileResult(BaseModel):
    direct: SummaryMetrics
    derived: DerivedMetrics


class FileComparison(BaseModel):
    baseline: FileResult
    modified: FileResult


class CodeLinkOutput(BaseModel):
    unmapped_regressions: Optional[SummaryMetrics] = None
    unmapped_improvements: Optional[SummaryMetrics] = None
    files: Dict[str, FileComparison]


class DifferentiationOutput(BaseModel):
    matched: SummaryMetrics
    modified: SummaryMetrics
    added: Optional[SummaryMetrics] = None
    removed: SummaryMetrics


class OutputSection(BaseModel):
    time_tracking: TimeTracking
    subgraph: SubgraphOutput
    baseline: DifferentiationOutput
    modified: DifferentiationOutput
    code_link: CodeLinkOutput


class BenchmarkResult(BaseModel):
    input: InputSection
    output: OutputSection