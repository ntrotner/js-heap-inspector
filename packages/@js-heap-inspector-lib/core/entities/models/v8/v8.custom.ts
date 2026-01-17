import {
  type V8RuntimeSchema,
} from './v8.core';

export type CustomV8NodeAccessParameters = {
  allocation_time_ms?: number;
  load_count: number;
  store_count: number;
};

export type CustomV8Parameters = {
  nodes: Array<{
    id: number;
  } & CustomV8NodeAccessParameters>;
};

export type CustomV8Metrics = {
  metrics?: CustomV8Parameters;
};

export type CustomV8RuntimeSchema = CustomV8Metrics & V8RuntimeSchema;
