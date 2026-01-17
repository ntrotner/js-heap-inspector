import {
  type CustomV8NodeAccessParameters,
  type CustomV8Parameters,
} from '../models';

export function isV8AccessParameters(nodeMetric: Record<string, unknown>): nodeMetric is CustomV8NodeAccessParameters {
  return (typeof nodeMetric.allocation_time_ms === 'number' || nodeMetric.allocation_time_ms === undefined)
    && typeof nodeMetric.load_count === 'number'
    && typeof nodeMetric.store_count === 'number';
}

export function isV8CustomMetrics(metrics: unknown): metrics is CustomV8Parameters {
  if (!metrics || typeof metrics !== 'object' || !('nodes' in metrics && Array.isArray(metrics.nodes))) {
    return false;
  }

  return metrics.nodes.every(nodeMetric =>
    typeof nodeMetric === 'object'
    && typeof nodeMetric.id === 'number'
    && isV8AccessParameters(nodeMetric),
  );
}
