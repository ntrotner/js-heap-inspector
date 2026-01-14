import type {
  NodeCore,
  NodeCommon,
  NodeExtended,
} from '../models';
import {
  isBoolean,
  isObject,
  isString,
  isStringArray,
} from './utils';

/**
 * Checks whether the given value satisfies the `NodeCore` schema.
 * @param value
 */
export function isNodeCore(value: unknown): value is NodeCore {
  if (!isObject(value)) {
    return false;
  }

  return isString((value as any).id) && isStringArray((value as any).edgeIds);
}

/**
 * Checks whether the given value satisfies the `NodeCommon` schema.
 * @param value
 */
export function isNodeCommon(value: unknown): value is NodeCommon {
  if (!isNodeCore(value)) {
    return false;
  }

  const v = value as any;
  if (!isString(v.value)) {
    return false;
  }

  if (typeof v.size !== 'number' || !Number.isFinite(v.size)) {
    return false;
  }

  if ('root' in v && v.root !== undefined && !isBoolean(v.root)) {
    return false;
  }

  return true;
}

/**
 * Checks whether the given value satisfies the `NodeExtended` schema.
 * @param value
 */
export function isNodeExtended(value: unknown): value is NodeExtended {
  if (!isNodeCommon(value)) {
    return false;
  }

  const v = value as any;
  if ('traceId' in v && v.traceId !== undefined && !isString(v.traceId)) {
    return false;
  }

  return true;
}
