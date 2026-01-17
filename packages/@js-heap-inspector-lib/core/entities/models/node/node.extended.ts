import {
  type EnergyMetric,
} from '../energy';
import {
  type NodeCommon,
} from './node.common';

export type NodeExtended = {
  energy?: EnergyMetric;
  traceId?: string;
  value?: string;
} & NodeCommon;
