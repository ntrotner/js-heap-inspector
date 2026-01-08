import {
  type RuntimeParser,
} from '../runtime-parser';
import {
  type NodeExtended,
} from '../node';
import {
  type EdgeExtended,
} from '../edge';
import {
  type StackExtended,
} from '../stack';
import {
  type Runtime,
} from '../runtime';
import {
  type V8RuntimeSchema,
} from './v8.core';

export type V8SupportedRuntime = Runtime<NodeExtended, EdgeExtended, StackExtended>;

export type V8RuntimeParser = RuntimeParser<V8RuntimeSchema, V8SupportedRuntime>;
