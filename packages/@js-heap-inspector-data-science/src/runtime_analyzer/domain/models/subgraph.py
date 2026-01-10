from pydantic import BaseModel
from typing import List
from .node import Node
from .edge import Edge

class Subgraph(BaseModel):
    """
    Represents a portion of the runtime graph.
    """
    center_node_id: str
    nodes: List[Node]
    edges: List[Edge]
