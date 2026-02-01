import argparse
from visualizer.application.services.resolution_distance_types.resolution_distance_types import \
    ResolutionDistanceTypes
from visualizer.application.services.resolution_file_size_heatmap.resolution_file_size_heatmap import \
    ResolutionFileSizeHeatmap
from visualizer.application.services.resolution_matching_count.resolution_matching_count import ResolutionMatchingCount
from visualizer.application.services.resolution_matching_size.resolution_matching_size import ResolutionMatchingSize
from visualizer.application.services.resolution_subgraph.resolution_subgraph import ResolutionSubgraph
from visualizer.application.services.resolution_subgraph_time.resolution_subgraph_time import ResolutionSubgraphTime
from visualizer.application.services.thesis_presenter_reader.thesis_presenter_reader import ThesisPresenterReader

OBSERVABLE_RESULTS = {
    "otter": {
        "simple": {
            "community-detection": [
                "otter-simple-showcase-community-detection-1",
                "otter-simple-showcase-community-detection-2",
                "otter-simple-showcase-community-detection-3",
                "otter-simple-showcase-community-detection-4",
                "otter-simple-showcase-community-detection-5"
            ],
            "heuristic-greedy": [
                "otter-simple-showcase-heuristic-greedy-1",
                "otter-simple-showcase-heuristic-greedy-2",
                "otter-simple-showcase-heuristic-greedy-3",
                "otter-simple-showcase-heuristic-greedy-4",
                "otter-simple-showcase-heuristic-greedy-5"
            ]
        },
        "extensive": {
            "community-detection": [
                "otter-extensive-showcase-community-detection-1",
                "otter-extensive-showcase-community-detection-2",
                "otter-extensive-showcase-community-detection-3",
                "otter-extensive-showcase-community-detection-4",
                "otter-extensive-showcase-community-detection-5"
            ],
            "heuristic-greedy": [
                "otter-extensive-showcase-heuristic-greedy-1",
                "otter-extensive-showcase-heuristic-greedy-2",
                "otter-extensive-showcase-heuristic-greedy-3",
                "otter-extensive-showcase-heuristic-greedy-4",
                "otter-extensive-showcase-heuristic-greedy-5"
            ]
        },
    }
}


def main():
    parser = argparse.ArgumentParser(description="Generate visualizations for thesis results.")
    parser.add_argument("--benchmark", required=True, help="Benchmark to generate visualizations for.")

    args = parser.parse_args()
    
    if args.benchmark == "otter":
        run_visualisation_for_otter()
    else:
        raise ValueError(f"Unsupported benchmark: {args.benchmark}")


def run_visualisation_for_otter():
    otter_benchmark = OBSERVABLE_RESULTS["otter"]
    
    for benchmark_types in otter_benchmark.keys():
        for subgraph_types in otter_benchmark[benchmark_types].keys():
            try:
                output_dir = f"./otter/{benchmark_types}/{subgraph_types}"
                benchmark_data = [f"./data/{file}/result-reporter-thesis_report.json" for file in otter_benchmark[benchmark_types][subgraph_types]]
                thesis_presenter_reader = ThesisPresenterReader()
                thesis_presenter_reader.load_benchmark_data(benchmark_data)
                
                heatmap_generator = ResolutionFileSizeHeatmap(thesis_presenter_reader)
                heatmap_generator.generate_per_file(output_dir, 'size')
                heatmap_generator.generate_per_file(output_dir, 'counter')
        
                ResolutionDistanceTypes(thesis_presenter_reader).generate_per_file(output_dir)

                ResolutionSubgraph(thesis_presenter_reader).generate(output_dir)

                ResolutionSubgraphTime(thesis_presenter_reader).generate(output_filepath=f"{output_dir}/subgraph_time.png")

                ResolutionMatchingSize(thesis_presenter_reader).generate(output_filepath=f"{output_dir}/matching_size")
                ResolutionMatchingCount(thesis_presenter_reader).generate(output_filepath=f"{output_dir}/matching_count")
            except Exception as e:
                print(f"Error while generating visualizations for {benchmark_types}/{subgraph_types}: {e}")

if __name__ == "__main__":
    main()
