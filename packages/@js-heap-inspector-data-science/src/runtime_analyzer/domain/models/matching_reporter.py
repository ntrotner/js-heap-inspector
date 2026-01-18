from pydantic import BaseModel


class MatchingReporterAccessCountResult(BaseModel):
    read_counter_diff: int
    write_counter_diff: int
    read_size_diff: int
    write_size_diff: int
