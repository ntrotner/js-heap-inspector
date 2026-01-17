import {
  type EnergyAccessMetric,
  type SoftwareEnergyRecording,
} from '../models';

export function createSoftwareEnergyRecording<T>(metrics: T): SoftwareEnergyRecording<T> {
  return {
    metrics,
  };
}

export function createEnergyAccessMetric(nodeId: string, readCounter: number, writeCounter: number, allocationTime?: number): EnergyAccessMetric {
  return {
    nodeId,
    allocationTime,
    readCounter,
    writeCounter,
  };
}
