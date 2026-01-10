import {
  type NodeCore,
  type NodeCommon,
  type NodeExtended,
} from '../models';
import {
  createSoftwareEnergyRecording,
} from './energy.factory';

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
    energy: createSoftwareEnergyRecording([]),
    root,
  };
}

export function createNodeExtended(
  id: string,
  edgeIds: string[],
  type: string,
  root: boolean,
  value?: string,
  traceId?: string,
): NodeExtended {
  return {
    id,
    edgeIds,
    type,
    energy: createSoftwareEnergyRecording([]),
    root,
    value,
    traceId,
  };
}
