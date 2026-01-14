import fs from "node:fs";
import {
  LifecycleMetric,
  PerformanceReportJson,
  PlaywrightPerformanceMetric
} from "../../entities";

export class PlaywrightPerformanceReporterParserService {

  /**
   * Parses all available heap snapshots from the given report file
   * 
   * @param sourceFile
   */
  public async parse(sourceFile: string): Promise<string[]> {
    const heapSnapshots = await this.getAllAvailableRawHeapSnapshots(sourceFile);
    console.log(`Found ${heapSnapshots.length} heap snapshots.`);

    return heapSnapshots;
  }

  /**
   * Parses all available heap snapshots from the given report file
   * 
   * @param filename
   */
  private async getAllAvailableRawHeapSnapshots(filename: string): Promise<string[]> {
    return Promise.all(
      this.getAllMetricsFromReport(filename)
        .flatMap(metric => metric.heapObjectsTracking ?? [])
    );
  }
  
  private getAllMetricsFromReport(filename: string): PlaywrightPerformanceMetric[] {
    const fileContent = fs.readFileSync(filename, 'utf8');
    const serializedReport: PerformanceReportJson = JSON.parse(fileContent);
    const accumulator = [] as PlaywrightPerformanceMetric[];

    for (const run of serializedReport) {
      for (const runId in run) {
        for (const testStep in run[runId]) {
          const metrics = ['startMetrics', 'stopMetrics', 'samplingMetrics'];

          for (const metric of metrics) {
            // @ts-ignore
            const metricsData = run[runId][testStep][metric] as LifecycleMetric[];

            for (const metricData of metricsData) {
              accumulator.push(metricData.metric);
            }
          }
        }
      }
    }

    return accumulator;
  }
}