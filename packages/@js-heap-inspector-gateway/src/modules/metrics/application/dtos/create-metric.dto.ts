import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';

/**
 * Data Transfer Object for creating a new metric.
 */
export class CreateMetricDto {
  /**
   * The name of the metric.
   *
   * @type {string}
   */
  @IsString()
  @MinLength(1)
  @MaxLength(255)
    name: string;

  /**
   * The type of the metric.
   *
   * @type {string}
   */
  @IsString()
    type: string;

  /**
   * The metric value.
   */
  @IsString()
  value: string;
}
