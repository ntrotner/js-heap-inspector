from pydantic import BaseModel
from typing import List

class Stack(BaseModel):
    id: str
    frameIds: List[str]
    functionName: str
    scriptName: str
    lineNumber: int
    columnNumber: int
