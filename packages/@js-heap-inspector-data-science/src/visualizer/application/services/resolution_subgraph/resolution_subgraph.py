import matplotlib.pyplot as plt
import pandas as pd


from visualizer.application.services.thesis_presenter_reader.thesis_presenter_reader import ThesisPresenterReader


class ResolutionSubgraph:
    def __init__(self, thesis_presenter_reader: ThesisPresenterReader):
        self.thesis_presenter_reader = thesis_presenter_reader

    def generate(self, output_filepath: str):
        """
        Generates a diagram with resolution on x-axis and two Y scales:
        1. Amount of subgraphs (baseline | modified)
        2. Amount of nodes in sets (matched, modified, added, removed)
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
            
            # Subgraphs
            sg_baseline = benchmark.output.subgraph.baseline
            sg_modified = benchmark.output.subgraph.modified
            
            # Nodes - Baseline sets
            nodes_bl_matched = benchmark.output.baseline.matched.nodes
            nodes_bl_modified = benchmark.output.baseline.modified.nodes
            nodes_bl_added = benchmark.output.baseline.added.nodes if benchmark.output.baseline.added else 0
            nodes_bl_removed = benchmark.output.baseline.removed.nodes
            
            # Nodes - Modified sets
            nodes_mod_matched = benchmark.output.modified.matched.nodes
            nodes_mod_modified = benchmark.output.modified.modified.nodes
            nodes_mod_added = benchmark.output.modified.added.nodes if benchmark.output.modified.added else 0
            nodes_mod_removed = benchmark.output.modified.removed.nodes

            data.append({
                "resolution": res,
                "type": "baseline",
                "subgraphs": sg_baseline,
                "matched": nodes_bl_matched,
                "modified": nodes_bl_modified,
                "added": nodes_bl_added,
                "removed": nodes_bl_removed
            })
            data.append({
                "resolution": res,
                "type": "modified",
                "subgraphs": sg_modified,
                "matched": nodes_mod_matched,
                "modified": nodes_mod_modified,
                "added": nodes_mod_added,
                "removed": nodes_mod_removed
            })

        df = pd.DataFrame(data)
        df = df.sort_values("resolution")

        # Plotting
        fig, ax1 = plt.subplots(figsize=(12, 7))

        ax2 = ax1.twinx()

        # Define colors and markers
        # Baseline: solid lines, Modified: dashed lines
        
        # Subgraphs (ax1)
        ax1.plot(df[df["type"] == "baseline"]["resolution"], df[df["type"] == "baseline"]["subgraphs"], 
                 'o-', label="Subgraphs (Baseline)", color='black', markersize=10, linewidth=2, alpha=0.7)
        ax1.plot(df[df["type"] == "modified"]["resolution"], df[df["type"] == "modified"]["subgraphs"], 
                 'x--', label="Subgraphs (Modified)", color='black', markersize=12, linewidth=2, alpha=0.7, markeredgewidth=2)
        
        ax1.set_xlabel(x_label, fontsize=18)
        ax1.set_ylabel("Amount of Subgraphs", fontsize=18)
        ax1.tick_params(axis='both', which='major', labelsize=14)
        
        # Nodes (ax2)
        node_metrics = ["matched", "modified", "added", "removed"]
        colors = ['blue', 'orange', 'green', 'red']
        
        for metric, color in zip(node_metrics, colors):
            ax2.plot(df[df["type"] == "baseline"]["resolution"], df[df["type"] == "baseline"][metric], 
                     'v-', label=f"{metric.capitalize()} Nodes (Baseline)", color=color, alpha=0.7, markersize=10, linewidth=2)
            ax2.plot(df[df["type"] == "modified"]["resolution"], df[df["type"] == "modified"][metric], 
                     'x--', label=f"{metric.capitalize()} Nodes (Modified)", color=color, alpha=0.7, markersize=12, linewidth=2, markeredgewidth=2)

        ax2.set_ylabel("Amount of Nodes", fontsize=18)
        ax2.tick_params(axis='y', labelsize=14)

        plt.title(f"{x_label} vs Subgraphs and Node Sets", fontsize=22)
        
        # Legend - combine both axes
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left', bbox_to_anchor=(1.1, 1), fontsize=16)

        fig.tight_layout()
        plt.savefig(f"{output_filepath}/resolution_subgraph.png", dpi=300, bbox_inches="tight")
        plt.close()
        print(f"Diagram saved to {output_filepath}")