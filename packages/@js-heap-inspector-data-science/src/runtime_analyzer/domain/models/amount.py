from pydantic import BaseModel

class Amount(BaseModel):
    value: float
    decimalPlaces: int
