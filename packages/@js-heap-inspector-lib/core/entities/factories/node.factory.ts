import {
  type NodeCore,
  type NodeCommon,
  type NodeExtended,
} from '../models';
import {
  createSoftwareEnergy,
} from './energy.factory';
import {
  createAmount,
} from './amount.factory';

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
    energy: createSoftwareEnergy(createAmount(0, 0)),
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
    energy: createSoftwareEnergy(createAmount(0, 0)),
    root,
    value,
    traceId,
  };
}
