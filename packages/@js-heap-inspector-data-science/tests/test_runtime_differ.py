import pytest
from runtime_analyzer.domain.models import Runtime, DifferentiationResult, MatchResult
from runtime_analyzer.application.services import RuntimeDifferService, DifferentiationAlgorithm

class MockAlgorithm(DifferentiationAlgorithm):
    def differentiate(self, baseline: Runtime, modified: Runtime) -> DifferentiationResult:
        # Simple mock implementation
        return DifferentiationResult(
            matched=[MatchResult(baseline_node_id="1", modified_node_id="1")],
            modified=[],
            added_node_ids=[],
            removed_node_ids=[]
        )

def test_runtime_differ_service_orchestration():
    # Arrange
    baseline = Runtime(nodes=[], edges=[], stacks=[])
    modified = Runtime(nodes=[], edges=[], stacks=[])
    algorithm = MockAlgorithm()
    service = RuntimeDifferService(algorithm)
    
    # Act
    result = service.compare(baseline, modified)
    
    # Assert
    assert isinstance(result, DifferentiationResult)
    assert len(result.matched) == 1
    assert result.matched[0].baseline_node_id == "1"
