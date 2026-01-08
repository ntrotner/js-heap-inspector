import type {
  SoftwareEnergy,
} from '../energy';
import {
  type NodeCore,
} from './node.core';

export type NodeCommon = {
  type: string;
  energy: SoftwareEnergy;
  root: boolean;
} & NodeCore;
