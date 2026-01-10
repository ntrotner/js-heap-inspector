from pydantic import BaseModel

class Edge(BaseModel):
    id: str
    fromNodeId: str
    toNodeId: str
    name: str
