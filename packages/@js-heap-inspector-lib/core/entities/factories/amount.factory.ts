import {
  type Amount,
} from '../models';

export function createAmount(value: number, decimalPlaces: number): Amount {
  return {
    value,
    decimalPlaces,
  };
}
