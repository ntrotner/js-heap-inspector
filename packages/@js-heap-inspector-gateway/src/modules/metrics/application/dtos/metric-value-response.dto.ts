/**
 * Data Transfer Object for metric value response.
 */
export type MetricValueResponseDto = {
  /**
   * The metric value ID.
   */
  id: string;

  /**
   * The metric name.
   */
  name: string;

  /**
   * The metric type.
   */
  type: string;

  /**
   * The metric value.
   */
  value: Buffer;

  /**
   * The metric value size.
   */
  size: number;

  /**
   * The creation date.
   */
  creationDate: Date;
};
