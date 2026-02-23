import {
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * Data Transfer Object for fetching a metric.
 */
export class FetchMetricDto {
  /**
   * The metric ID.
   *
   * @type {string}
   */
  @IsString()
  @IsUUID()
    id: string;
}
