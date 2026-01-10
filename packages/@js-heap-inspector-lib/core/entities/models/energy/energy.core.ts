import {
  type Amount,
} from '../amount';

export type Energy = {
  value: Amount;
  unit: string;
};

export type SoftwareEnergyRecording<T = unknown> = {
  metrics: T;
};
