import {
  type SoftwareEnergyRecording,
} from '../energy';
import {
  type NodeCore,
} from './node.core';

export type NodeCommon = {
  type: string;
  energy: SoftwareEnergyRecording;
  root: boolean;
} & NodeCore;
