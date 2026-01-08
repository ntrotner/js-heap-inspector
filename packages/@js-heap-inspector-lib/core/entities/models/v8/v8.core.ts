export type V8RuntimeSchema = {
  snapshot: V8SnapshotMeta;
  nodes: number[];
  edges: number[];
  trace_function_infos: number[];
  trace_tree: TraceTree;
  samples: number[];
  locations: number[];
  strings: string[];
};

export type TraceTree = [number, number, number, number, TraceTree[]];

export type V8SnapshotMeta = {
  meta: V8Meta;
  node_count: number;
  edge_count: number;
  trace_function_count: number;
  extra_native_bytes: number;
};

export type V8Meta = {
  node_fields: string[];
  node_types: [string[], string, string, string, string, string, string];
  edge_fields: string[];
  edge_types: [string[], string, string];
  trace_function_info_fields: string[];
  trace_node_fields: string[];
  sample_fields: string[];
  location_fields: string[];
};

export type CallStackRoot = {
  head: CallNode;
};

export type CallFrameNode = {
  columnNumber: number;
  functionName: string;
  lineNumber: number;
  scriptId: string;
  url: string;
};

export type CallNode = {
  callFrame: CallFrameNode;
  children: CallNode[];
  id: string;
  selfSize: number;
};

export type TraceNodeRoot = {
  head: TraceNode;
};

export type TraceNode = {
  id: string;
  function_info_index: number;
  function_info: TraceFunctionInfo | undefined;
  count: number;
  size: number;
  children: TraceNode[];
  nodes: any[];
  functionPath: string;
};

export type TraceFunctionInfo = {
  function_id: string;
  name: string;
  script_name: string;
  script_id: string;
  line: number;
  column: number;
};
