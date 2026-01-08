import {
  type Amount,
  type SoftwareEnergy,
} from '../models';

export function createSoftwareEnergy(value: Amount): SoftwareEnergy {
  return {
    value,
    unit: 'joules',
  };
}
