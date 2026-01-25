from typing import List, Dict, Optional
from pydantic import BaseModel, PrivateAttr
from .node import Node
from .edge import Edge
from .stack import Stack

class Runtime(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    stacks: List[Stack]
    _nodes_by_id: Dict[str, Node] = PrivateAttr(default_factory=dict)

    def model_post_init(self, __context):
        self._nodes_by_id = {node.id: node for node in self.nodes}

    def get_node_by_id(self, node_id: str) -> Node:
        node = self._nodes_by_id.get(node_id)
        if node:
            return node
        raise ValueError(f"Node with id {node_id} not found")
