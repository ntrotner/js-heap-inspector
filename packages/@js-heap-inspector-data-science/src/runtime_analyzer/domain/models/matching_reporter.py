from pydantic import BaseModel


class MatchingReporterAccessCountResult(BaseModel):
    baseline_read_counter: int
    baseline_write_counter: int
    baseline_read_size: int
    baseline_write_size: int
    modified_read_counter: int
    modified_write_counter: int
    modified_read_size: int
    modified_write_size: int
