import {
  type Runtime,
} from '../runtime';
import {
  type EdgeCore,
} from '../edge';
import {
  type StackCore,
} from '../stack';
import {
  type NodeCore,
} from '../node';

export type RuntimeParser<RuntimeSchema, RuntimeModel extends Runtime<NodeCore, EdgeCore, StackCore>> = {
  /**
   * Check if the runtime schema is compatible
   * @param runtime
   */
  isCompatibleRuntimeSchema(runtime: unknown): runtime is RuntimeSchema;

  /**
   * Load the runtime schema
   * @param runtime
   */
  load(runtime: RuntimeSchema): void;

  /**
   * Convert the raw runtime data to a Runtime object
   */
  convert(): RuntimeModel;
};
