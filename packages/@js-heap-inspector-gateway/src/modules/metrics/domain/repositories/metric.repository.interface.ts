import {
  Injectable,
} from '@nestjs/common';
import {
  type Metric,
} from '../entities/metric.entity';
import {
  type MetricName,
} from '../value-objects/metric-name.value-object';

/**
 * Repository interface for Metric entity.
 */
@Injectable()
export abstract class MetricRepository {
  /**
   * Finds a metric by ID.
   *
   * @param {string} id - The metric ID to search for.
   * @return {Promise<Metric | undefined>} A promise that resolves to the metric or undefined.
   */
  abstract findById(id: string): Promise<Metric | undefined>;

  /**
   * Finds all metrics for a specific user.
   *
   * @param {string} userId - The user ID to search for.
   * @return {Promise<Metric[]>} A promise that resolves to an array of metrics.
   */
  abstract findByUserId(userId: string): Promise<Metric[]>;

  /**
   * Saves a metric.
   *
   * @param {Metric} metric - The metric to save.
   * @return {Promise<Metric>} A promise that resolves to the saved metric.
   */
  abstract save(metric: Metric): Promise<Metric>;

  /**
   * Deletes a metric by ID.
   *
   * @param {string} id - The metric ID to delete.
   * @return {Promise<void>} A promise that resolves when the metric is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates the name of a metric.
   *
   * @param {string} id - The metric ID to update.
   * @param {MetricName} name - The new metric name.
   * @return {Promise<Metric>} A promise that resolves to the updated metric.
   */
  abstract updateName(id: string, name: MetricName): Promise<Metric>;

  /**
   * Saves a metric value.
   *
   * @param {string} metricId - The metric ID.
   * @param {Buffer} value - The metric value.
   * @return {Promise<void>} A promise that resolves when the value is saved.
   */
  abstract saveValue(metricId: string, value: Buffer): Promise<void>;

  /**
   * Retrieves a metric value.
   *
   * @param {string} metricId - The metric ID.
   * @return {Promise<Buffer | undefined>} A promise that resolves to the value or undefined.
   */
  abstract getValue(metricId: string): Promise<Buffer | undefined>;

  /**
   * Deletes a metric value.
   *
   * @param {string} metricId - The metric ID.
   * @return {Promise<void>} A promise that resolves when the value is deleted.
   */
  abstract deleteValue(metricId: string): Promise<void>;
}
