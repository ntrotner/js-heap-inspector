import {
  type StackCommon,
} from './stack.common';

export type StackExtended = Record<string, unknown> & StackCommon;
