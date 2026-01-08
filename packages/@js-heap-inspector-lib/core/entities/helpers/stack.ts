import {
  type StackCommon,
  type StackCore,
  type StackExtended,
} from '../models';
import {
  isObject,
  isString,
  isStringArray,
  isNumber,
} from './utils';

export function isStackCore(value: unknown): value is StackCore {
  if (!isObject(value)) {
    return false;
  }

  const v = value as any;
  return isString(v.id) && isStringArray(v.frameIds);
}

export function isStackCommon(value: unknown): value is StackCommon {
  if (!isStackCore(value)) {
    return false;
  }

  const v = value as any;
  return (
    isString(v.functionName)
    && isString(v.scriptName)
    && isNumber(v.lineNumber)
    && isNumber(v.columnNumber)
  );
}

export function isStackExtended(value: unknown): value is StackExtended {
  return isStackCommon(value);
}
