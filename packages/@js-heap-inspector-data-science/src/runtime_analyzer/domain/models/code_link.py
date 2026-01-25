from typing import List
from .code_evolution import CodeEvolution
from pydantic import BaseModel

class CausalPair(BaseModel):
    """Represents a link between a memory node and a code change."""
    node_id: str
    code_evolution: CodeEvolution
    confidence: str # 'Direct' or 'Derived'

class CodeLinkContainer(BaseModel):
    """Output container for the linkage analysis."""
    regressions: List[CausalPair]
    improvements: List[CausalPair]
    unmappable_regressions: List[str]
    unmappable_improvements: List[str]