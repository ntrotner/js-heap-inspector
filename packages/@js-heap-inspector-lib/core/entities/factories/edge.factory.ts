import {
  type EdgeCore,
  type EdgeCommon,
  type EdgeExtended,
} from '../models';

export function createEdgeCore(id: string, fromNodeId: string, toNodeId: string, name: string): EdgeCore {
  return {
    id,
    fromNodeId,
    toNodeId,
    name,
  };
}

export function createEdgeCommon(id: string, fromNodeId: string, toNodeId: string, name: string): EdgeCommon {
  return {
    id,
    fromNodeId,
    toNodeId,
    name,
  };
}

export function createEdgeExtended(id: string, fromNodeId: string, toNodeId: string, name: string, type?: string): EdgeExtended {
  return {
    id,
    fromNodeId,
    toNodeId,
    name,
    type,
  };
}
