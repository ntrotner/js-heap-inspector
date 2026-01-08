import {
  type EdgeCommon,
} from './edge.common';

export type EdgeExtended = {
  // Optional by schema
  type?: string;
} & EdgeCommon;
