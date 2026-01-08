import {
  createNodeExtended,
  type EdgeExtended,
  type NodeExtended,
  type StackCommon,
  type TraceFunctionInfo,
  type TraceTree,
  type V8RuntimeParser,
  type V8RuntimeSchema,
  type V8SupportedRuntime,
} from '../../../entities';

export class V8Parser implements V8RuntimeParser {
  /**
   * V8 Runtime Schema
   */
  private v8Runtime: V8RuntimeSchema | undefined;

  /**
   * Parsed runtime
   */
  private runtime: V8SupportedRuntime | undefined;

  /**
   * Global strings pool
   */
  private strings: string[] = [];

  public isCompatibleRuntimeSchema(_runtime: unknown): _runtime is V8RuntimeSchema {
    return true;
  }

  /**
   * @inheritDoc
   */
  public convert(): V8SupportedRuntime {
    if (!this.v8Runtime) {
      throw new Error('V8Parser: runtime schema is not loaded. Call load() first.');
    }

    if (this.runtime) {
      return this.runtime;
    }

    const runtime = this.v8Runtime;
    const {snapshot, nodes, edges, strings} = runtime;
    const {meta} = snapshot;
    const nodeFieldCount = meta.node_fields.length;
    const edgeFieldCount = meta.edge_fields.length;
    this.strings = strings;

    // Safety checks
    if (nodeFieldCount <= 0 || edgeFieldCount <= 0) {
      throw new Error('V8Parser: invalid meta information in V8 snapshot.');
    }

    // Build nodes and index by node array offset ("to_node" in edges references this offset)
    const typeNames = meta.node_types[0];
    const nodeByOffset = new Map<number, NodeExtended>();
    const parsedNodes = [] as NodeExtended[];

    for (let i = 0; i < snapshot.node_count; i++) {
      const offset = nodes[i * nodeFieldCount];
      const node = this.buildNodes(nodes, i * nodeFieldCount, typeNames, nodeFieldCount, meta.node_fields);
      parsedNodes.push(node);
      nodeByOffset.set(offset, node);
    }

    // Build edges walking through the edge array; edges are grouped per node in order
    const edgeTypeNames = meta.edge_types[0];
    let edgeCursor = 0;
    const parsedEdges = [] as EdgeExtended[];
    let edgeIdCounter = 0;

    for (const fromNode of parsedNodes) {
      const edgeCount: number = (fromNode as any)?.__edgeCount ?? 0;

      for (let index = 0; index < edgeCount; index++) {
        let typeIndex: number | undefined;
        let nameOrIndex: number | undefined;
        let toNodeOffset: number | undefined;

        for (let attributeCount = 0; attributeCount < edgeFieldCount; attributeCount++) {
          const attributeKey = meta.edge_fields[attributeCount];
          const attributeValue = edges[edgeCursor + attributeCount];
          switch (attributeKey) {
            case 'type': {
              typeIndex = attributeValue;
              break;
            }

            case 'name_or_index': {
              nameOrIndex = attributeValue;
              break;
            }

            case 'to_node': {
              toNodeOffset = attributeValue;
              break;
            }

            default: {
              break;
            }
          }
        }

        if (typeIndex === undefined || nameOrIndex === undefined || toNodeOffset === undefined) {
          throw new Error('V8Parser: invalid edge metadata in V8 snapshot.');
        }

        edgeCursor += edgeFieldCount;
        const typeName = edgeTypeNames[typeIndex] ?? 'unknown';
        const toNode = nodeByOffset.get(toNodeOffset);
        if (!toNode) {
          // Skip edges pointing to an unknown node offset
          continue;
        }

        // Resolve edge name
        const edgeName: string = typeName === 'element' ? `[${nameOrIndex}]` : this.getGlobalString(nameOrIndex);
        const edgeId = String(edgeIdCounter++);
        const edge = {
          id: edgeId,
          fromNodeId: fromNode.id,
          toNodeId: toNode.id,
          name: edgeName,
          type: typeName,
        };
        parsedEdges.push(edge);

        // Our node model expects edgeIds: string[]; since Edge has no id, use edge name as a stable identifier
        if (!fromNode.edgeIds.includes(edgeId)) {
          fromNode.edgeIds.push(edgeId);
        }
      }

      // Cleanup temp fields
      delete (fromNode as any).__edgeCount;
      delete (fromNode as any).__offset;
    }

    const parsedStacks = this.buildTraceStack();
    if (!parsedStacks) {
      throw new Error('V8Parser: invalid trace tree in V8 snapshot.');
    }

    this.runtime = {
      nodes: parsedNodes,
      edges: parsedEdges,
      stacks: parsedStacks,
    };

    return this.runtime;
  }

  public load(runtime: V8RuntimeSchema): void {
    this.v8Runtime = runtime;
    this.runtime = undefined;
  }

  /**
   * Helpers to read string pool safely
   *
   * @param index
   */
  private getGlobalString(index: number): string {
    if (index === undefined || index === null) {
      return '';
    }

    if (index < 0 || index >= this.strings.length) {
      return String(index);
    }

    return this.strings[index] ?? '';
  }

  /**
   * Parse trace function info from raw trace function info array.
   *
   * @param rawTraceFunction
   * @param traceFunctionInfoFields
   */
  private parseTraceFunction(rawTraceFunction: number[], traceFunctionInfoFields: string[]): TraceFunctionInfo {
    let functionId: string | undefined;
    let name: string | undefined;
    let scriptName: string | undefined;
    let scriptId: string | undefined;
    let line: number | undefined;
    let column: number | undefined;

    for (const [i, attributeKey] of traceFunctionInfoFields.entries()) {
      const attributeValue = rawTraceFunction[i];

      switch (attributeKey) {
        case 'line': {
          line = attributeValue;
          break;
        }

        case 'column': {
          column = attributeValue;
          break;
        }

        case 'function_id': {
          functionId = String(attributeValue);
          break;
        }

        case 'name': {
          name = this.getGlobalString(attributeValue);
          break;
        }

        case 'script_name': {
          scriptName = this.getGlobalString(attributeValue);
          break;
        }

        case 'script_id': {
          scriptId = String(attributeValue);
          break;
        }

        default: {
          break;
        }
      }
    }

    if (scriptName === undefined || scriptId === undefined || name === undefined || functionId === undefined || line === undefined || column === undefined) {
      throw new Error('V8Parser: invalid trace function metadata in V8 snapshot.');
    }

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      function_id: functionId,
      name,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      script_name: scriptName,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      script_id: scriptId,
      line,
      column,
    };
  }

  /**
   * Build trace function info array from trace function info fields.
   */
  private buildTraceFunction() {
    const accumulator = new Array<TraceFunctionInfo>();
    const traceFunctionInfoFields = this.v8Runtime?.snapshot.meta.trace_function_info_fields ?? [];
    const traceFunctionInfo = this.v8Runtime?.trace_function_infos ?? [];

    for (let i = 0; i < traceFunctionInfo.length; i += traceFunctionInfoFields.length) {
      const rawTraceFunctionInfo = traceFunctionInfo.slice(i, i + traceFunctionInfoFields.length);
      const parsedTraceFunctionInfo = this.parseTraceFunction(rawTraceFunctionInfo, traceFunctionInfoFields);
      accumulator.push(parsedTraceFunctionInfo);
    }

    return accumulator;
  }

  private parseStack(
    traceFunctionInfo: TraceFunctionInfo[],
    rawTraceNode: number[],
    traceTreeFields: string[],
    childrenIds?: string[],
  ): StackCommon {
    let id = '';
    let functionName = '';
    let scriptName = '';
    let lineNumber = 0;
    let columnNumber = 0;

    for (const [i, field] of traceTreeFields.entries()) {
      const value = rawTraceNode[i];

      switch (field) {
        case 'id': {
          id = String(value);
          break;
        }

        case 'function_info_index': {
          const info = traceFunctionInfo.at(value);
          if (info) {
            functionName = info.name;
            scriptName = info.script_name;
            lineNumber = info.line;
            columnNumber = info.column;
          }

          break;
        }

        default: {
          break;
        }
      }
    }

    return {
      id,
      frameIds: childrenIds ?? [],
      functionName,
      scriptName,
      lineNumber,
      columnNumber,
    };
  }

  /**
   * Recursively parse trace tree into stacks.
   *
   * @param traceFunctionInfo
   * @param traceTree
   * @param traceTreeFields
   */
  private parseStacks(traceFunctionInfo: TraceFunctionInfo[], traceTree: TraceTree, traceTreeFields: string[]): StackCommon[] | undefined {
    const accumulator: StackCommon[] = [];
    const rawTraceNodeLenght = traceTreeFields.length;
    const pivot: TraceTree[] = [traceTree.slice(0, rawTraceNodeLenght) as TraceTree];

    while (pivot.length > 0) {
      const traceNode = pivot.pop()!;
      const children: TraceTree[] | undefined = traceTreeFields.includes('children') ? traceNode[traceTreeFields.indexOf('children')] as TraceTree[] : undefined;
      const indexOfId = traceTreeFields.indexOf('id');
      const childrenIds: string[] = [];

      if (children) {
        for (let i = 0; i < children.length; i += rawTraceNodeLenght) {
          const childSlices = children.slice(i, i + rawTraceNodeLenght);
          pivot.push(...childSlices);
          childrenIds.push(String(childSlices[indexOfId]));
        }
      }

      const stack = this.parseStack(traceFunctionInfo, traceNode as any, traceTreeFields, childrenIds);
      accumulator.push(stack);
    }

    return accumulator;
  }

  /**
   * Build trace stack from trace tree.
   */
  private buildTraceStack() {
    const traceFunctionInfo = this.buildTraceFunction();
    const traceTree = this.v8Runtime?.trace_tree ?? [];
    const traceTreeFields = this.v8Runtime?.snapshot.meta.trace_node_fields ?? [];
    if (!traceTree || traceTree?.length === 0) {
      return;
    }

    return this.parseStacks(traceFunctionInfo, traceTree, traceTreeFields);
  }

  /**
   * Build node from raw node array.
   *
   * @param nodes
   * @param base
   * @param typeNames
   * @param nodeFieldCount
   * @param node_fields
   * @private
   */
  private buildNodes(nodes: number[], base: number, typeNames: string[], nodeFieldCount: number, node_fields: string[]): NodeExtended {
    let typeIndex: number | undefined;
    let nameIndex: number | undefined;
    let idNumber: number | undefined;
    let selfSize: number | undefined;
    let edgeCount: number | undefined;
    let traceNodeId: number | undefined;

    for (let attributeCount = 0; attributeCount < nodeFieldCount; attributeCount++) {
      const attributeKey = node_fields[attributeCount];
      const attributeValue = nodes[base + attributeCount];
      switch (attributeKey) {
        case 'type': {
          typeIndex = attributeValue;
          break;
        }

        case 'name': {
          nameIndex = attributeValue;
          break;
        }

        case 'id': {
          idNumber = attributeValue;
          break;
        }

        case 'self_size': {
          selfSize = attributeValue;
          break;
        }

        case 'edge_count': {
          edgeCount = attributeValue;
          break;
        }

        case 'trace_node_id': {
          traceNodeId = attributeValue;
          break;
        }

        default: {
          break;
        }
      }
    }

    if (traceNodeId === undefined || typeIndex === undefined || nameIndex === undefined || idNumber === undefined || selfSize === undefined || edgeCount === undefined) {
      throw new Error('V8Parser: invalid node metadata in V8 snapshot.');
    }

    const typeName = typeNames[typeIndex] ?? 'unknown';
    const name = this.getGlobalString(nameIndex);
    const id = String(idNumber);
    const node = createNodeExtended(
      id,
      [],
      typeName,
      typeName === 'synthetic' && name.toLowerCase().includes('root'),
      name,
      traceNodeId > 0 ? String(traceNodeId) : undefined,
    );

    (node as any).__edgeCount = edgeCount;
    (node as any).__offset = base;
    return node;
  }
}
