import {
  type SoftwareEnergyRecording,
} from './energy.core';

export type EnergyAccessMetric = {
  nodeId: string;
  allocationTime?: number;
  readCounter: number;
  writeCounter: number;
  size: number;
};

export type EnergyAccessRecording = SoftwareEnergyRecording<EnergyAccessMetric[]>;
