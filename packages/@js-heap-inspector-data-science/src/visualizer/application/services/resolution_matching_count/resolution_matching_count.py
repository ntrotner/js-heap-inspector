import matplotlib.pyplot as plt
import pandas as pd

import os
from visualizer.application.services.thesis_presenter_reader.thesis_presenter_reader import ThesisPresenterReader


class ResolutionMatchingCount:
    def __init__(self, thesis_presenter_reader: ThesisPresenterReader):
        self.thesis_presenter_reader = thesis_presenter_reader

    def generate(self, output_filepath: str):
        """
        Generates a line chart with resolution on x-axis and counts on y-axis.
        Shows read and write counters for input and various output categories (matched, modified, added, removed).
        """
        benchmarks = self.thesis_presenter_reader.benchmarks
        if not benchmarks:
            raise ValueError("Benchmarks not loaded. Call load_benchmark_data first.")

        data = []
        x_label = "Resolution"
        for benchmark in benchmarks:
            res = benchmark.input.parameters.subgraph.resolution
            if res is None:
                res = benchmark.input.parameters.subgraph.k
                x_label = "k"
            
            # Input counts
            in_bl = benchmark.input.baseline
            in_mod = benchmark.input.modified
            
            # Output Baseline sets
            out_bl = benchmark.output.baseline
            # Output Modified sets
            out_mod = benchmark.output.modified

            metrics = {
                "resolution": res,
                "in_bl_read": in_bl.read_counter,
                "in_bl_write": in_bl.write_counter,
                "in_mod_read": in_mod.read_counter,
                "in_mod_write": in_mod.write_counter,
                
                "out_bl_matched_read": out_bl.matched.read_counter,
                "out_bl_matched_write": out_bl.matched.write_counter,
                "out_bl_modified_read": out_bl.modified.read_counter,
                "out_bl_modified_write": out_bl.modified.write_counter,
                "out_bl_added_read": out_bl.added.read_counter if out_bl.added else 0,
                "out_bl_added_write": out_bl.added.write_counter if out_bl.added else 0,
                "out_bl_removed_read": out_bl.removed.read_counter,
                "out_bl_removed_write": out_bl.removed.write_counter,

                "out_mod_matched_read": out_mod.matched.read_counter,
                "out_mod_matched_write": out_mod.matched.write_counter,
                "out_mod_modified_read": out_mod.modified.read_counter,
                "out_mod_modified_write": out_mod.modified.write_counter,
                "out_mod_added_read": out_mod.added.read_counter if out_mod.added else 0,
                "out_mod_added_write": out_mod.added.write_counter if out_mod.added else 0,
                "out_mod_removed_read": out_mod.removed.read_counter,
                "out_mod_removed_write": out_mod.removed.write_counter,
            }
            data.append(metrics)

        df = pd.DataFrame(data)
        df = df.sort_values("resolution")

        # Plotting
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(15, 12), sharex=True)

        categories = ["matched", "modified", "added", "removed"]
        colors = ['blue', 'orange', 'green', 'red']
        
        # Read Counts (ax1)
        ax1.plot(df["resolution"], df["in_bl_read"], 'k-', label="Input Baseline Read", alpha=0.4, linewidth=3)
        ax1.plot(df["resolution"], df["in_mod_read"], 'k--', label="Input Modified Read", alpha=0.4, linewidth=3)
        
        for cat, color in zip(categories, colors):
            ax1.plot(df["resolution"], df[f"out_bl_{cat}_read"], marker='o', linestyle='-', color=color, label=f"Out BL {cat.capitalize()} Read", markersize=10, linewidth=2, alpha=0.7)
            ax1.plot(df["resolution"], df[f"out_mod_{cat}_read"], marker='x', linestyle='--', color=color, label=f"Out Mod {cat.capitalize()} Read", markersize=12, linewidth=2, alpha=0.7, markeredgewidth=2)
            
        ax1.set_ylabel("Read Count", fontsize=18)
        ax1.set_title(f"{x_label} vs Read Counts", fontsize=22)
        ax1.legend(loc='upper left', bbox_to_anchor=(1, 1), fontsize=16)
        ax1.grid(True, which="both", ls="-", alpha=0.2)
        ax1.tick_params(axis='both', which='major', labelsize=14)

        # Write Counts (ax2)
        ax2.plot(df["resolution"], df["in_bl_write"], 'k-', label="Input Baseline Write", alpha=0.4, linewidth=3)
        ax2.plot(df["resolution"], df["in_mod_write"], 'k--', label="Input Modified Write", alpha=0.4, linewidth=3)
        
        for cat, color in zip(categories, colors):
            ax2.plot(df["resolution"], df[f"out_bl_{cat}_write"], marker='o', linestyle='-', color=color, label=f"Out BL {cat.capitalize()} Write", markersize=10, linewidth=2, alpha=0.7)
            ax2.plot(df["resolution"], df[f"out_mod_{cat}_write"], marker='x', linestyle='--', color=color, label=f"Out Mod {cat.capitalize()} Write", markersize=12, linewidth=2, alpha=0.7, markeredgewidth=2)
            
        ax2.set_xlabel(x_label, fontsize=18)
        ax2.set_ylabel("Write Count", fontsize=18)
        ax2.set_title(f"{x_label} vs Write Counts", fontsize=22)
        ax2.legend(loc='upper left', bbox_to_anchor=(1, 1), fontsize=16)
        ax2.grid(True, which="both", ls="-", alpha=0.2)
        ax2.tick_params(axis='both', which='major', labelsize=14)

        plt.tight_layout()
        
        # Ensure the directory exists
        if not os.path.exists(output_filepath):
             os.makedirs(output_filepath, exist_ok=True)

        save_path = f"{output_filepath}/resolution_matching_count.png"
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
        plt.close()
        print(f"Diagram saved to {save_path}")