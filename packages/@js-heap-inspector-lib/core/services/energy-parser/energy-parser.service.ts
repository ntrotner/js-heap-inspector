import {
  createEnergyAccessMetric,
  createSoftwareEnergyRecording,
  type EnergyAccessMetric,
  type EnergyAccessRecording,
  isV8AccessParameters,
  isV8CustomMetrics,
  type SoftwareEnergyRecording,
} from '../../entities';

export class EnergyParserService {
  /**
   * Convert unknown metrics to EnergyAccessRecording.
   *
   * @param input unparsed metrics
   * @returns EnergyAccessRecording or undefined if not parsable
   */
  public convertToEnergyAccessRecording(input: SoftwareEnergyRecording): EnergyAccessRecording | undefined {
    const result: EnergyAccessMetric[] = [];

    if (!input.metrics || !isV8CustomMetrics(input.metrics)) {
      return undefined;
    }

    for (const nodeMetric of input.metrics.nodes) {
      if (isV8AccessParameters(nodeMetric)) {
        result.push(
          createEnergyAccessMetric(
            String(nodeMetric.id),
            nodeMetric.load_count,
            nodeMetric.store_count,
            0,
            nodeMetric.allocation_time_ms,
          ),
        );
      }
    }

    return createSoftwareEnergyRecording<EnergyAccessMetric[]>(result);
  }
}
