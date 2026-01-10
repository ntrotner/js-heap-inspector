from typing import List
from pydantic import BaseModel
from .node import Node
from .edge import Edge
from .stack import Stack

class Runtime(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    stacks: List[Stack]