import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  JwtPayload,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  FetchMetricDto,
} from '@js-heap-inspector-gateway/modules/metrics/application';
import {
  MetricRepository,
} from '@js-heap-inspector-gateway/modules/metrics/domain';
import {
  Injectable,
} from '@nestjs/common';

/**
 * Use case for deleting a metric.
 */
@Injectable()
export class DeleteMetricUseCase implements UseCase<FetchMetricDto, void, JwtPayload> {
  constructor(
    private readonly metricRepository: MetricRepository,
  ) {}

  /**
   * Executes the delete process.
   *
   * @param {FetchMetricDto} dto - The delete data.
   * @param context
   * @return {Promise<void>} A promise that resolves when the metric is deleted.
   */
  public async execute(dto: FetchMetricDto, context: JwtPayload): Promise<void> {
    const {id} = dto;

    // Fetch metric by ID
    const metric = await this.metricRepository.findById(id);
    if (!metric) {
      throw new Error('Metric not found.');
    }

    // Verify ownership
    if (metric.getUser().id !== context.user.id) {
      throw new Error('You do not have permission to delete this metric.');
    }

    // Delete metric value if exists
    await this.metricRepository.deleteValue(id);

    // Delete metric
    await this.metricRepository.delete(id);
  }
}
