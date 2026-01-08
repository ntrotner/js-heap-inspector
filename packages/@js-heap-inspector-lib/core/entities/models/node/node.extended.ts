import {
  type NodeCommon,
} from './node.common';

export type NodeExtended = {
  value?: string;
  traceId?: string;
} & NodeCommon;
