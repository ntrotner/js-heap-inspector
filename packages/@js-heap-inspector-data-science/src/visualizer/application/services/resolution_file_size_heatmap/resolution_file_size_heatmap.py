import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

import os
import re
from typing import Dict, Optional, List
from visualizer.application.services.thesis_presenter_reader.thesis_presenter_reader import ThesisPresenterReader


class ResolutionFileSizeHeatmap:
    def __init__(self, thesis_presenter_reader: ThesisPresenterReader):
        self.thesis_presenter_reader = thesis_presenter_reader

    def generate(self, output_filepath: str, metrics: List[str], file_name: Optional[str] = None):
        """
        Generates a heatmap visualization of resolution vs distance,
        with intensity based on total values of the provided metrics.

        :param output_filepath: Path to save the generated heatmap image.
        :param metrics: List of metrics to include in the grouped heatmap.
                        Expected values: 'read_size', 'write_size', 'read_counter', 'write_counter'.
        :param file_name: Optional file name to filter data. If None, aggregates all files.
        """

        benchmarks = self.thesis_presenter_reader.benchmarks
        if benchmarks is None:
            raise ValueError("Benchmarks not loaded. Call load_benchmark_data first.")

        data = []
        x_label = "Resolution"
        for benchmark in benchmarks:
            resolution = benchmark.input.parameters.subgraph.resolution
            if resolution is None:
                resolution = benchmark.input.parameters.subgraph.k
                x_label = "K"

            # Aggregate metrics across all files for each distance
            # distance_metrics: Dict[int, Dict[str, Dict[str, int]]] = {distance: {metric: {"baseline": val, "modified": val}}}
            distance_metrics: Dict[int, Dict[str, Dict[str, int]]] = {}

            for f_name, file_comp in benchmark.output.code_link.files.items():
                if file_name and file_name != f_name:
                    continue

                for metric in metrics:
                    # Process baseline
                    if hasattr(file_comp.baseline.derived, 'distances') and isinstance(
                            file_comp.baseline.derived.distances, dict):
                        for dist_str, dist_metric in file_comp.baseline.derived.distances.items():
                            distance = dist_metric.distance
                            value = getattr(dist_metric.metrics, metric, 0)
                            if distance not in distance_metrics:
                                distance_metrics[distance] = {m: {"baseline": 0, "modified": 0} for m in metrics}
                            distance_metrics[distance][metric]["baseline"] += int(value)

                    if hasattr(file_comp.baseline, 'direct'):
                        distance = 0
                        value = getattr(file_comp.baseline.direct, metric, 0)
                        if distance not in distance_metrics:
                            distance_metrics[0] = {m: {"baseline": 0, "modified": 0} for m in metrics}
                        distance_metrics[distance][metric]["baseline"] += int(value)

                    # Process modified
                    if hasattr(file_comp.modified.derived, 'distances') and isinstance(
                            file_comp.modified.derived.distances, dict):
                        for dist_str, dist_metric in file_comp.modified.derived.distances.items():
                            distance = dist_metric.distance
                            value = getattr(dist_metric.metrics, metric, 0)
                            if distance not in distance_metrics:
                                distance_metrics[distance] = {m: {"baseline": 0, "modified": 0} for m in metrics}
                            distance_metrics[distance][metric]["modified"] += int(value)

                    if hasattr(file_comp.modified, 'direct'):
                        distance = 0
                        value = getattr(file_comp.modified.direct, metric, 0)
                        if distance not in distance_metrics:
                            distance_metrics[0] = {m: {"baseline": 0, "modified": 0} for m in metrics}
                        distance_metrics[distance][metric]["modified"] += int(value)

            for distance, metric_values in distance_metrics.items():
                item = {
                    "resolution": int(resolution),
                    "distance": int(distance),
                }
                for metric, values in metric_values.items():
                    val_baseline = values["baseline"]
                    val_modified = values["modified"]

                    item[f"baseline_{metric}"] = int(val_baseline)
                    item[f"modified_{metric}"] = int(val_modified)
                data.append(item)

        if not data:
            msg = "No data found for heatmap generation"
            if file_name:
                msg += f" for file: {file_name}"
            print(f"{msg}.")
            return

        df = pd.DataFrame(data)

        # We need subplots: len(metrics) rows, 2 columns (baseline and modified)
        n_rows = len(metrics)
        fig, axes = plt.subplots(n_rows, 2, figsize=(16, 3.5 * n_rows), sharey=True, sharex=True, gridspec_kw=dict(width_ratios=[0.7,0.8]))

        # If n_rows == 1, axes is 1D, make it 2D for consistent indexing
        if n_rows == 1:
            axes = axes.reshape(1, 2)

        # Find common min/max for color scale consistency across all metrics in this plot
        v_min_max_metrics = {}

        pivots = {}
        for metric in metrics:
            if metric not in v_min_max_metrics:
                v_min_max_metrics[metric] = {"vmin": 0, "vmax": 1}
            
            pivot_baseline = df.pivot_table(index="distance", columns="resolution", values=f"baseline_{metric}",
                                            aggfunc="sum")
            pivot_modified = df.pivot_table(index="distance", columns="resolution", values=f"modified_{metric}",
                                            aggfunc="sum")

            # Sort indices and columns
            pivot_baseline = pivot_baseline.sort_index(ascending=False)
            pivot_baseline = pivot_baseline.reindex(sorted(pivot_baseline.columns), axis=1)

            pivot_modified = pivot_modified.sort_index(ascending=False)
            pivot_modified = pivot_modified.reindex(sorted(pivot_modified.columns), axis=1)

            pivots[metric] = (pivot_baseline, pivot_modified)

            v_min_max_metrics[metric]["vmin"] = min(v_min_max_metrics[metric]["vmin"], pivot_baseline.min().min(), pivot_modified.min().min())
            v_min_max_metrics[metric]["vmax"] = max(v_min_max_metrics[metric]["vmax"], pivot_baseline.max().max(), pivot_modified.max().max())

        for i, metric in enumerate(metrics):
            pivot_baseline, pivot_modified = pivots[metric]

            ax_baseline = axes[i, 0]
            ax_modified = axes[i, 1]

            vmin, vmax = v_min_max_metrics[metric]["vmin"], v_min_max_metrics[metric]["vmax"]
            
            label_suffix = ""
            fmt = "d"
            if metric in ["read_size", "write_size"]:
                # Check if we should use GB or MB
                max_val = max(vmax, abs(vmin))
                if max_val < 1024 * 1024 * 1024: # Less than 1 GB
                    pivot_baseline /= (1024 * 1024)
                    pivot_modified /= (1024 * 1024)
                    vmin /= (1024 * 1024)
                    vmax /= (1024 * 1024)
                    label_suffix = " (MB)"
                    fmt = ".3f"
                else:
                    pivot_baseline /= (1024 * 1024 * 1024)
                    pivot_modified /= (1024 * 1024 * 1024)
                    vmin /= (1024 * 1024 * 1024)
                    vmax /= (1024 * 1024 * 1024)
                    label_suffix = " (GB)"
                    fmt = ".3f"

            readable_metric = metric.replace("_", " ").title()
            sns.heatmap(pivot_baseline, annot=True, cbar=False, fmt=fmt, ax=ax_baseline,
                        vmin=vmin, vmax=vmax, cbar_kws={'label': ''},
                        annot_kws={"size": 14, "fontweight": "bold"})
            ax_baseline.set_title(f"Baseline {readable_metric}{label_suffix}", fontsize=20)
            ax_baseline.set_xlabel(x_label, fontsize=20)
            ax_baseline.set_ylabel("Distance", fontsize=20)
            ax_baseline.tick_params(axis='both', which='major', labelsize=14)

            sns.heatmap(pivot_modified, annot=True, cbar=True, fmt=fmt, ax=ax_modified,
                        vmin=vmin, vmax=vmax, cbar_kws={'label': ''},
                        annot_kws={"size": 14, "fontweight": "bold"})
            ax_modified.set_title(f"Modified {readable_metric}{label_suffix}", fontsize=20)
            ax_modified.set_xlabel(x_label, fontsize=20)
            ax_modified.set_ylabel("", fontsize=20)  # Shared y-axis
            ax_modified.tick_params(axis='both', which='major', labelsize=14)
            
        fig.suptitle("", fontsize=24)

        plt.tight_layout()
        plt.savefig(output_filepath, dpi=500, bbox_inches='tight')
        plt.close()
        print(f"Heatmap saved to {output_filepath}")

    def generate_per_file(self, output_dir: str, group: str):
        """
        Generates heatmaps per file found in the benchmark results.
        Groups metrics into 'size' and 'counter' images.

        :param output_dir: Directory where heatmaps will be saved.
        """

        benchmarks = self.thesis_presenter_reader.benchmarks
        if not benchmarks:
            raise ValueError("Benchmarks not loaded. Call load_benchmark_data first.")

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Collect all unique file names across all benchmarks
        file_names = set()
        for benchmark in benchmarks:
            file_names.update(benchmark.output.code_link.files.keys())

        groups = {
            "size": ["read_size", "write_size"],
            "counter": ["read_counter", "write_counter"]
        }

        for file_name in file_names:
            # Sanitize file name for file path
            sanitized_name = re.sub(r'[^\w\-_.]', '_', file_name)

            metrics = groups[group]
            output_filepath = os.path.join(output_dir, f"heatmap_{group}_{sanitized_name}.png")
            try:
                self.generate(output_filepath, metrics=metrics, file_name=file_name)
            except Exception as e:
                print(f"Error generating heatmap for file {file_name}: {e}")
