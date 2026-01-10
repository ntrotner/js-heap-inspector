from pydantic import BaseModel
from typing import List, Optional, Any
from .energy import SoftwareEnergyRecording

class Node(BaseModel):
    id: str
    edgeIds: List[str]
    type: str
    energy: Optional[SoftwareEnergyRecording[Any]] = None
    root: bool = False
    value: Optional[str] = None
    traceId: Optional[str] = None
