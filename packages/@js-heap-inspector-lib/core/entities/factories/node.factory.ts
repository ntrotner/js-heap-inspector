import {
  type NodeCore,
  type NodeCommon,
  type NodeExtended,
  type EnergyMetric,
} from '../models';

export function createNodeCore(id: string, edgeIds: string[]): NodeCore {
  return {
    id,
    edgeIds,
  };
}

export function createNodeCommon(
  id: string,
  edgeIds: string[],
  type: string,
  root: boolean,
): NodeCommon {
  return {
    id,
    edgeIds,
    type,
    root,
  };
}

export function createNodeExtended(
  id: string,
  edgeIds: string[],
  type: string,
  root: boolean,
  energy?: EnergyMetric,
  value?: string,
  traceId?: string,
): NodeExtended {
  return {
    id,
    edgeIds,
    type,
    energy,
    root,
    value,
    traceId,
  };
}
