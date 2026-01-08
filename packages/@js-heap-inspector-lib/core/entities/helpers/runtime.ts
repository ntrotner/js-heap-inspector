import type {
  EdgeCore,
  NodeCore,
  Runtime,
  StackCore,
} from '../entities';
import {
  isObject,
} from './utils';
import {
  isNodeCore,
} from './node';
import {
  isEdgeCore,
} from './edge';
import {
  isStackCore,
} from './stack';

/**
 * Checks whether the given value satisfies the `Runtime` schema.
 * Ensures:
 * - nodes: NodeCore[]
 * - edges: EdgeCore[]
 * - stacks: StackCore[]
 */
export function isRuntime(value: unknown): value is Runtime<NodeCore, EdgeCore, StackCore> {
  if (!isObject(value)) {
    return false;
  }

  const v = value as any;

  if (!Array.isArray(v.nodes) || !v.nodes.every((node: unknown) => isNodeCore(node))) {
    return false;
  }

  if (!Array.isArray(v.edges) || !v.edges.every((edge: unknown) => isEdgeCore(edge))) {
    return false;
  }

  if (!Array.isArray(v.stacks) || !v.stacks.every((stack: unknown) => isStackCore(stack))) {
    return false;
  }

  return true;
}
