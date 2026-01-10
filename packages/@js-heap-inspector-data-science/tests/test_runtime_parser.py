import pytest
import json
from runtime_analyzer.application.services.runtime_parser import RuntimeParserService
from runtime_analyzer.domain.exceptions import ParsingError
from runtime_analyzer.domain.models.runtime import Runtime

def test_parse_valid_runtime_data():
    valid_data = {
        "nodes": [
            {
                "id": "n1", 
                "edgeIds": ["e1"], 
                "type": "object", 
                "root": True,
                "energy": {"metrics": {"cpu": 10}}
            },
            {"id": "n2", "edgeIds": [], "type": "string"}
        ],
        "edges": [
            {"id": "e1", "fromNodeId": "n1", "toNodeId": "n2", "name": "property"}
        ],
        "stacks": [
            {
                "id": "s1", 
                "frameIds": ["f1"], 
                "functionName": "main", 
                "scriptName": "app.js", 
                "lineNumber": 1, 
                "columnNumber": 1
            }
        ],
        "total_energy": {
            "value": {"value": 100.5, "decimalPlaces": 1},
            "unit": "mJ"
        }
    }
    raw_input = json.dumps(valid_data)
    service = RuntimeParserService()
    runtime = service.parse(raw_input)

    assert isinstance(runtime, Runtime)
    assert len(runtime.nodes) == 2
    assert runtime.nodes[0].id == "n1"
    assert runtime.nodes[0].root is True
    assert runtime.nodes[0].energy.metrics["cpu"] == 10
    assert len(runtime.edges) == 1
    assert runtime.edges[0].name == "property"
    assert len(runtime.stacks) == 1
    assert runtime.stacks[0].functionName == "main"
    assert runtime.total_energy.unit == "mJ"
    assert runtime.total_energy.value.value == 100.5

def test_parse_invalid_json():
    service = RuntimeParserService()
    with pytest.raises(ParsingError) as excinfo:
        service.parse("invalid json")
    assert "Invalid JSON input" in str(excinfo.value)

def test_parse_malformed_runtime_data():
    service = RuntimeParserService()
    malformed_data = {"nodes": "not a list"}
    with pytest.raises(ParsingError) as excinfo:
        service.parse(json.dumps(malformed_data))
    assert "Failed to parse runtime data" in str(excinfo.value)
