import matplotlib.pyplot as plt
import pandas as pd


from visualizer.application.services.thesis_presenter_reader.thesis_presenter_reader import ThesisPresenterReader


class ResolutionSubgraphTime:
    def __init__(self, thesis_presenter_reader: ThesisPresenterReader):
        self.thesis_presenter_reader = thesis_presenter_reader

    def generate(self, output_filepath: str):
        """
        Generates a diagram with resolution on x-axis and two Y scales:
        1. Total time needed for all steps (converted to minutes)
        2. Amount of subgraphs (baseline | modified)
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
            
            # Time tracking
            tt = benchmark.output.time_tracking
            
            # Summing all durations
            # Formula: (end - start) for each phase
            total_seconds = (
                (tt.subgraph_generation_end - tt.subgraph_generation_start) +
                (tt.differentiation_algorithm_end - tt.differentiation_algorithm_start) +
                (tt.code_link_algorithm_end - tt.code_link_algorithm_start)
            )
            total_minutes = total_seconds / 60.0

            data.append({
                "resolution": res,
                "subgraphs_baseline": sg_baseline,
                "subgraphs_modified": sg_modified,
                "total_time_min": total_minutes
            })

        df = pd.DataFrame(data)
        df = df.sort_values("resolution")

        # Plotting
        fig, ax1 = plt.subplots(figsize=(12, 7))

        ax2 = ax1.twinx()

        # Time tracking (ax1) - using a bar chart or line? 
        # The prompt says "show the amount of subgraphs ... similar to ResolutionSubgraph", 
        # which uses lines. Let's use lines for both for consistency if it looks good.
        
        ax1.plot(df["resolution"], df["total_time_min"], 's-', label="Total Time (Minutes)", color='purple', markersize=10, linewidth=2, alpha=0.8)
        ax1.set_xlabel(x_label, fontsize=18)
        ax1.set_ylabel("Total Time (Minutes)", fontsize=18)
        ax1.tick_params(axis='both', which='major', labelsize=14)
        
        # Subgraphs (ax2)
        ax2.plot(df["resolution"], df["subgraphs_baseline"], 'o-', label="Subgraphs (Baseline)", color='black', markersize=10, linewidth=2, alpha=0.7)
        ax2.plot(df["resolution"], df["subgraphs_modified"], 'x--', label="Subgraphs (Modified)", color='gray', markersize=12, linewidth=2, alpha=0.7, markeredgewidth=2)

        ax2.set_ylabel("Amount of Subgraphs", fontsize=18)
        ax2.tick_params(axis='y', labelsize=14)

        plt.title(f"{x_label} vs Total Time and Subgraph Counts", fontsize=22)
        
        # Legend - combine both axes
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left', bbox_to_anchor=(1.1, 1), fontsize=16)

        fig.tight_layout()
        plt.savefig(output_filepath, dpi=300, bbox_inches="tight")
        plt.close()
        print(f"Diagram saved to {output_filepath}")
