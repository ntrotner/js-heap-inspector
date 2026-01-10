from typing import Literal

from pydantic import BaseModel

class CodeChangeSpan(BaseModel):
    lineStart: int
    lineEnd: int
    columnStart: int
    columnEnd: int

class CodeEvolution(BaseModel):
    fileId: str
    modificationType: Literal['insert', 'delete', 'modify']
    modificationSource: Literal['base', 'modified']
    codeChangeSpan: CodeChangeSpan
