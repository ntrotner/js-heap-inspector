import {
  type StackCore,
} from './stack.core';

export type StackCommon = {
  functionName: string;
  scriptName: string;
  lineNumber: number;
  columnNumber: number;
} & StackCore;
