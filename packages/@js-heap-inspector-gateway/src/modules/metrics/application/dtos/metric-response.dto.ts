/**
 * Data Transfer Object for metric response.
 */
export type MetricResponseDto = {
  /**
   * The metric ID.
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
   * The creation date.
   */
  creationDate: Date;
};
