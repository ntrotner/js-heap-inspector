import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';

/**
 * Data Transfer Object for updating a metric name.
 *
 * @property {string} name - The new metric name.
 */
export class UpdateMetricNameDto {
  /**
   * The metric ID.
   *
   * @type {string}
   */
  @IsString()
  @IsUUID()
    id: string;

  /**
   * The new metric name.
   *
   * @type {string}
   */
  @IsString()
  @MinLength(1)
  @MaxLength(255)
    name: string;
}
