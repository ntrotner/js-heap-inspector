import {
  type Runtime,
  type NodeCore,
  type EdgeCore,
  type StackCore,
} from '../models';

export function createRuntime<N extends NodeCore, E extends EdgeCore, S extends StackCore>(
  nodes: N[],
  edges: E[],
  stacks: S[],
): Runtime<N, E, S> {
  return {
    nodes,
    edges,
    stacks,
  };
}
