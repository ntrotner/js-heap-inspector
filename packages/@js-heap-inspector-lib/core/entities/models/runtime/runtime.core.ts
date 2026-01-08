import {
  type NodeCore,
} from '../node';
import {
  type EdgeCore,
} from '../edge';
import {
  type StackCore,
} from '../stack';

export type Runtime<N extends NodeCore, E extends EdgeCore, S extends StackCore> = {
  nodes: N[];
  edges: E[];
  stacks: S[];
};
