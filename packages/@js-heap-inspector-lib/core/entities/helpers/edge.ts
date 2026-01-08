import type {
  EdgeCore,
  EdgeCommon,
  EdgeExtended,
} from '../entities';
import {
  isObject,
  isString,
} from './utils';

/**
 * Checks whether the given value satisfies the `EdgeCore` schema.
 * @param value
 */
export function isEdgeCore(value: unknown): value is EdgeCore {
  if (!isObject(value)) {
    return false;
  }

  const v = value as any;
  return isString(v.fromNodeId) && isString(v.toNodeId) && isString(v.name);
}

/*+
 * Checks whether the given value satisfies the `EdgeCommon` schema.
 */
export function isEdgeCommon(value: unknown): value is EdgeCommon {
  return isEdgeCore(value);
}

/**
 * Checks whether the given value satisfies the `EdgeExtended` schema.
 * @param value
 */
export function isEdgeExtended(value: unknown): value is EdgeExtended {
  if (!isEdgeCommon(value)) {
    return false;
  }

  const v = value as any;
  if ('type' in v && v.type !== undefined && !isString(v.type)) {
    return false;
  }

  return true;
}
