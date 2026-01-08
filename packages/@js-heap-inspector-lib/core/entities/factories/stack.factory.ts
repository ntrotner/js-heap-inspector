import {
  type StackCore,
  type StackCommon,
  type StackExtended,
} from '../models';

export function createStackCore(id: string, frameIds: string[]): StackCore {
  return {
    id,
    frameIds,
  };
}

export function createStackCommon(
  id: string,
  frameIds: string[],
  functionName: string,
  scriptName: string,
  lineNumber: number,
  columnNumber: number,
): StackCommon {
  return {
    id,
    frameIds,
    functionName,
    scriptName,
    lineNumber,
    columnNumber,
  };
}

export function createStackExtended(
  id: string,
  frameIds: string[],
  functionName: string,
  scriptName: string,
  lineNumber: number,
  columnNumber: number,
  extras?: Record<string, unknown>,
): StackExtended {
  return {
    id,
    frameIds,
    functionName,
    scriptName,
    lineNumber,
    columnNumber,
    ...extras,
  };
}
