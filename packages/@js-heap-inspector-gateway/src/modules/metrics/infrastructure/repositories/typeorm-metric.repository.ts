import {
  Metric,
  MetricName,
  MetricRepository,
  MetricValue,
} from '@js-heap-inspector-gateway/modules/metrics/domain';
import {
  Injectable,
} from '@nestjs/common';
import {
  InjectRepository,
} from '@nestjs/typeorm';
import {
  Repository,
} from 'typeorm';

/**
 * TypeORM implementation of the Metric repository.
 */
@Injectable()
export class TypeOrmMetricRepository implements MetricRepository {
  constructor(
    @InjectRepository(Metric)
    private readonly metricRepository: Repository<Metric>,
    @InjectRepository(MetricValue)
    private readonly metricValueRepository: Repository<MetricValue>,
  ) {}

  /**
   * Finds a metric by ID.
   *
   * @param {string} id - The metric ID to search for.
   * @return {Promise<Metric | undefined>} A promise that resolves to the metric or undefined.
   */
  async findById(id: string): Promise<Metric | undefined> {
    const metric = await this.metricRepository.findOne({
      where: {id},
      relations: ['user'],
    });
    return metric ?? undefined;
  }

  /**
   * Finds all metrics for a specific user.
   *
   * @param {string} userId - The user ID to search for.
   * @return {Promise<Metric[]>} A promise that resolves to an array of metrics.
   */
  async findByUserId(userId: string): Promise<Metric[]> {
    const metrics = await this.metricRepository.find({
      where: {user: {id: userId}},
      relations: ['user'],
    });
    return metrics;
  }

  /**
   * Saves a metric.
   *
   * @param {Metric} metric - The metric to save.
   * @return {Promise<Metric>} A promise that resolves to the saved metric.
   */
  async save(metric: Metric): Promise<Metric> {
    return this.metricRepository.save(metric);
  }

  /**
   * Deletes a metric by ID.
   *
   * @param {string} id - The metric ID to delete.
   * @return {Promise<void>} A promise that resolves when the metric is deleted.
   */
  async delete(id: string): Promise<void> {
    await this.metricRepository.delete(id);
  }

  /**
   * Updates the name of a metric.
   *
   * @param {string} id - The metric ID to update.
   * @param {MetricName} name - The new metric name.
   * @return {Promise<Metric>} A promise that resolves to the updated metric.
   */
  async updateName(id: string, name: MetricName): Promise<Metric> {
    const metric = await this.findById(id);
    if (!metric) {
      throw new Error('Metric not found.');
    }

    metric.setName(name);
    return this.save(metric);
  }

  /**
   * Saves a metric value.
   *
   * @param {string} metricId - The metric ID.
   * @param {Buffer} value - The metric value.
   * @return {Promise<void>} A promise that resolves when the value is saved.
   */
  async saveValue(metricId: string, value: Buffer): Promise<void> {
    const metricValue = new MetricValue();
    metricValue.metricId = metricId;
    metricValue.value = value;
    metricValue.size = value.length;
    await this.metricValueRepository.save(metricValue);
  }

  /**
   * Retrieves a metric value.
   *
   * @param {string} metricId - The metric ID.
   * @return {Promise<Buffer | undefined>} A promise that resolves to the value or undefined.
   */
  async getValue(metricId: string): Promise<Buffer | undefined> {
    const metricValue = await this.metricValueRepository.findOne({
      where: {metricId},
    });
    return metricValue?.value;
  }

  /**
   * Deletes a metric value.
   *
   * @param {string} metricId - The metric ID.
   * @return {Promise<void>} A promise that resolves when the value is deleted.
   */
  async deleteValue(metricId: string): Promise<void> {
    await this.metricValueRepository.delete({metricId});
  }
}
