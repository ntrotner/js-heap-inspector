import {
  type EdgeCore,
  type NodeCore,
  type Runtime,
  type RuntimeParser,
  type StackCore,
} from '../../entities';
import {
  V8Parser,
} from './v8-runtime-parser';

export class RuntimeParserOrchestrator {
  public parse(input: unknown): Runtime<NodeCore, EdgeCore, StackCore> | undefined {
    const availableParsers: Array<RuntimeParser<unknown, Runtime<NodeCore, EdgeCore, StackCore>>> = [new V8Parser()];

    for (const parser of availableParsers) {
      if (!parser.isCompatibleRuntimeSchema(input)) {
        continue;
      }

      parser.load(input);
      return parser.convert();
    }

    return undefined;
  }
}
