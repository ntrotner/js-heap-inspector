from typing import List
from pydantic import BaseModel
from .node import Node
from .edge import Edge
from .stack import Stack

class Runtime(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    stacks: List[Stack]

    def get_node_by_id(self, node_id: str) -> Node:
        for node in self.nodes:
            if node.id == node_id:
                return node
        raise ValueError(f"Node with id {node_id} not found")
