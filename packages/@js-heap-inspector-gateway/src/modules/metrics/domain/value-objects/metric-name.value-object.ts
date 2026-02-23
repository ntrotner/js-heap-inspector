import {
  Column,
} from 'typeorm';

/**
 * Represents a metric name value object.
 */
export class MetricName {
  @Column()
  value: string;

  /**
   * Validates the metric name.
   *
   * @param {string} name - The metric name to validate.
   * @throws {Error} If the metric name is invalid.
   */
  private validate(name: string): void {
    if (name.length === 0 || name.length > 255) {
      throw new Error('Metric name must be between 1 and 255 characters long.');
    }
  }

  /**
   * Returns the metric name value.
   *
   * @return {string} The metric name value.
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Creates a new MetricName instance.
   *
   * @param {string} value - The metric name value.
   * @return {MetricName} A new MetricName instance.
   */
  static create(value: string): MetricName {
    const metricName = new MetricName();
    metricName.value = value;
    return metricName;
  }
}
