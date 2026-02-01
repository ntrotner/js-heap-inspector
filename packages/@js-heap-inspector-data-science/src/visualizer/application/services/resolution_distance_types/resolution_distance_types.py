import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import os
import re
from typing import Dict, Optional, List
from visualizer.application.services.thesis_presenter_reader.thesis_presenter_reader import ThesisPresenterReader


class ResolutionDistanceTypes:
    def __init__(self, thesis_presenter_reader: ThesisPresenterReader):
        self.thesis_presenter_reader = thesis_presenter_reader

    def generate(self, output_filepath: str, metrics: List[str], file_name: Optional[str] = None,
                 distance_filter: Optional[str] = None, color_map: Optional[Dict[str, str]] = None,
                 y_limits: Optional[Dict[str, float]] = None):
        """
        Generates a plot with resolution on the x-axis and bar charts on the y-axis.
        Shows node_types in a specific distance, grouped by size and count.

        :param output_filepath: Path to save the generated image.
        :param metrics: List of metrics to include. Expected: 'size', 'count'.
        :param file_name: Optional file name to filter data. If None, aggregates all files.
        :param distance_filter: Optional distance string (e.g., 'direct', 'distance 1') to filter data.
        :param color_map: Optional dictionary mapping node types to colors.
        :param y_limits: Optional dictionary mapping metrics to their maximum y-axis value.
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
                x_label = "k"

            for f_name, file_comp in benchmark.output.code_link.files.items():
                if file_name and file_name != f_name:
                    continue

                for mode in ["baseline", "modified"]:
                    file_res = getattr(file_comp, mode)

                    # Direct (distance 0)
                    if not distance_filter or distance_filter == "direct":
                        if file_res.direct.node_types:
                            for nt in file_res.direct.node_types:
                                data.append({
                                    "resolution": int(resolution),
                                    "distance": "direct",
                                    "mode": mode,
                                    "type": nt.type,
                                    "count": nt.count,
                                    "write_count": nt.write_count,
                                    "read_count": nt.read_count,
                                    "write_size": nt.write_count * nt.size,
                                    "read_size": nt.read_count * nt.size,
                                    "size": nt.size
                                })

                    # Derived (distance > 0)
                    if file_res.derived.distances:
                        for dist_str, dist_metric in file_res.derived.distances.items():
                            dist_label = f"distance {dist_metric.distance}"
                            if distance_filter and distance_filter != dist_label:
                                continue

                            if dist_metric.metrics.node_types:
                                for nt in dist_metric.metrics.node_types:
                                    data.append({
                                        "resolution": int(resolution),
                                        "distance": dist_label,
                                        "mode": mode,
                                        "type": nt.type,
                                        "count": nt.count,
                                        "write_count": nt.write_count,
                                        "read_count": nt.read_count,
                                        "write_size": nt.write_count * nt.size,
                                        "read_size": nt.read_count * nt.size,
                                        "size": nt.size
                                    })

        if not data:
            print(f"No data found for resolution distance types plot (file: {file_name}, distance: {distance_filter}).")
            return

        df = pd.DataFrame(data)

        # Aggregate by resolution, distance, mode, type
        df_agg = df.groupby(["resolution", "distance", "mode", "type"]).sum().reset_index()

        # Plotting
        n_metrics = len(metrics)
        n_modes = 2  # baseline, modified
        fig, axes = plt.subplots(n_metrics, n_modes, figsize=(14, 2.5 * n_metrics), sharex=True)

        if n_metrics == 1:
            axes = axes.reshape(1, n_modes)

        for i, metric in enumerate(metrics):
            ylimit = y_limits.get(metric, 0) * 1.05
            for j, mode in enumerate(["baseline", "modified"]):
                ax = axes[i, j]
                subset = df_agg[(df_agg["mode"] == mode)]

                # Filter subset by distance if not already filtered in data collection (though it should be)
                if distance_filter:
                    subset = subset[subset["distance"] == distance_filter]

                readable_metric = metric.replace("_", " ").title()
                if subset.empty:
                    ax.set_title(f"{mode.capitalize()} {readable_metric} (No Data)", fontsize=16)
                    continue

                # Pivot for stacked bar
                pivot_df = subset.pivot_table(index="resolution", columns="type", values=metric, aggfunc="sum").fillna(
                    0)

                # Apply colors if map is provided
                colors = None
                if color_map:
                    colors = [color_map.get(col, "#333333") for col in pivot_df.columns]

                pivot_df.plot(kind='bar', stacked=True, ax=ax, color=colors)

                title = f"{mode.capitalize()} {readable_metric}"
                if distance_filter:
                    title += f" ({distance_filter.title()})"

                ax.set_title(title, fontsize=14)
                ax.set_xlabel(x_label, fontsize=14)
                if j != 1:
                    ax.set_ylabel(readable_metric, fontsize=14)
                else:
                    ax.set_ylabel("")
                ax.get_legend().remove()
                ax.grid(True, axis='y', linestyle='--', alpha=0.7)
                ax.set_ylim(0, ylimit)

        # accumulator of all lines and labels and have unique entries

        all_handles = []
        all_labels = []
        
        for i in range(n_metrics):
            for j in range(n_modes):
                handles, labels = axes[i, j].get_legend_handles_labels()
                all_handles.extend(handles)
                all_labels.extend(labels)
        
        # Deduplicate legend entries while preserving order
        unique_legend = {}
        for handle, label in zip(all_handles, all_labels):
            if label not in unique_legend:
                unique_legend[label] = handle
        
        unique_labels = list(unique_legend.keys())
        unique_handles = list(unique_legend.values())

        axes[0, 1].legend(unique_handles, unique_labels, title="Node Type", loc='upper left', bbox_to_anchor=(1, 1.05),
                          fontsize=12)

        if not os.path.exists(os.path.dirname(output_filepath)):
            os.makedirs(os.path.dirname(output_filepath), exist_ok=True)

        plt.savefig(output_filepath, bbox_inches="tight", dpi=400)
        plt.close()
        print(f"Plot saved to {output_filepath}")

    def generate_per_file(self, output_dir: str):
        """
        Generates plots per file and per distance found in the benchmark results.
        """
        benchmarks = self.thesis_presenter_reader.benchmarks
        if not benchmarks:
            raise ValueError("Benchmarks not loaded. Call load_benchmark_data first.")

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Collect all unique (file_name, distance) pairs and node types
        file_distances = set()
        all_node_types = set()

        # Calculate max y-limits for each metric per (file, distance) pair
        metrics = ["count", "write_count", "read_count"]
        plot_max_values = {}  # {(file_name, distance): {metric: max_val}}

        for benchmark in benchmarks:
            for f_name, file_comp in benchmark.output.code_link.files.items():
                for mode in ["baseline", "modified"]:
                    file_res = getattr(file_comp, mode)

                    # Process Direct
                    if file_res.direct.node_types:
                        dist_key = (f_name, "direct")
                        file_distances.add(dist_key)
                        if dist_key not in plot_max_values:
                            plot_max_values[dist_key] = {m: 0.0 for m in metrics}

                        mode_metric_sums = {m: 0.0 for m in metrics}
                        for nt in file_res.direct.node_types:
                            all_node_types.add(nt.type)
                            for m in metrics:
                                mode_metric_sums[m] += getattr(nt, m)
                        for m in metrics:
                            plot_max_values[dist_key][m] = max(plot_max_values[dist_key][m], mode_metric_sums[m])

                    # Process Derived
                    if file_res.derived.distances:
                        for dist_str, dist_metric in file_res.derived.distances.items():
                            if dist_metric.metrics.node_types:
                                dist_label = f"distance {dist_metric.distance}"
                                dist_key = (f_name, dist_label)
                                file_distances.add(dist_key)
                                if dist_key not in plot_max_values:
                                    plot_max_values[dist_key] = {m: 0.0 for m in metrics}

                                mode_metric_sums = {m: 0.0 for m in metrics}
                                for nt in dist_metric.metrics.node_types:
                                    all_node_types.add(nt.type)
                                    for m in metrics:
                                        mode_metric_sums[m] += getattr(nt, m)
                                for m in metrics:
                                    plot_max_values[dist_key][m] = max(plot_max_values[dist_key][m],
                                                                       mode_metric_sums[m])

        # Create color map for node types
        palette = sns.color_palette("husl", len(all_node_types))
        color_map = {nt: palette[i] for i, nt in enumerate(sorted(all_node_types))}

        for file_name, distance in file_distances:
            sanitized_file_name = re.sub(r'[^\w\-_.]', '_', file_name)
            sanitized_distance = re.sub(r'[^\w\-_.]', '_', distance)

            output_filepath = os.path.join(output_dir, f"distance_types_{sanitized_distance}_{sanitized_file_name}.png")
            self.generate(output_filepath, metrics=metrics, file_name=file_name, distance_filter=distance,
                          color_map=color_map, y_limits=plot_max_values[(file_name, distance)])
