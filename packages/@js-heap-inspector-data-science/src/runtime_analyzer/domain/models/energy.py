from .amount import Amount
from pydantic import BaseModel
from typing import Any, Generic, TypeVar, Optional

T = TypeVar("T")

class Amount(BaseModel):
    value: float
    decimalPlaces: int

class Energy(BaseModel):
    value: Amount
    unit: str

class SoftwareEnergyRecording(BaseModel, Generic[T]):
    metrics: Optional[T]
    
class EnergyAccessMetric(BaseModel):
    nodeId: str
    allocationTime: Optional[float]
    readCounter: int
    writeCounter: int
    
class EnergyMetric(EnergyAccessMetric):
    pass