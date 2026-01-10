import {
  type SoftwareEnergyRecording,
} from '../models';

export function createSoftwareEnergyRecording<T>(metrics: T): SoftwareEnergyRecording<T> {
  return {
    metrics,
  };
}
