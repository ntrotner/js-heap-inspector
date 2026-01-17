import {
  type NodeCore,
} from './node.core';

export type NodeCommon = {
  type: string;
  root: boolean;
} & NodeCore;
