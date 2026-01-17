from pydantic import BaseModel
from typing import List, Optional

from runtime_analyzer.domain.models import EnergyMetric

class Node(BaseModel):
    id: str
    edgeIds: List[str]
    type: str
    energy: Optional[EnergyMetric] = None
    root: bool = False
    value: Optional[str] = None
    traceId: Optional[str] = None
