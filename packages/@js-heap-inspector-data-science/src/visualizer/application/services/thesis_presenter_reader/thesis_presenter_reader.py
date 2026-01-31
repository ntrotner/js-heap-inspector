import json
import os
from typing import List

from pydantic import ValidationError

from visualizer.domain.models.thesis_presenter import BenchmarkResult


class ThesisPresenterReader:
    """
    Service class for reading and processing thesis presenter benchmark results.
    """

    def __init__(self):
        self.benchmarks = None

    def load_benchmark_data(self, filepaths: List[str]):
        """
        Loads, validates, and aggregates benchmark data using Pydantic models.
        """
        self.benchmarks = []
        filepaths.sort()

        print(f"Processing {len(filepaths)} files...")

        for filepath in filepaths:
            try:
                with open(filepath, 'r') as f:
                    raw_data = json.load(f)

                result = BenchmarkResult(**raw_data)
                self.benchmarks.append(result)
            except ValidationError as e:
                print(f"Schema Validation Error in {os.path.basename(filepath)}:\n{e}")
            except Exception as e:
                print(f"General Error in {os.path.basename(filepath)}: {e}")
