import {
  Column,
} from 'typeorm';

/**
 * Represents a metric type value object.
 */
export class MetricType {
  @Column()
  value: string;

  /**
   * Validates the metric type.
   *
   * @param {string} type - The metric type to validate.
   * @throws {Error} If the metric type is invalid.
   */
  private validate(type: string): void {
    if (type.length === 0 || type.length > 255) {
      throw new Error('Metric type must be between 1 and 255 characters long.');
    }
  }

  /**
   * Returns the metric type value.
   *
   * @return {string} The metric type value.
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Creates a new MetricType instance.
   *
   * @param {string} value - The metric type value.
   * @return {MetricType} A new MetricType instance.
   */
  static create(value: string): MetricType {
    const metricType = new MetricType();
    metricType.value = value;
    
    return metricType;
  }
}
