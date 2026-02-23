import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  JwtPayload,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  FetchMetricDto,
  MetricValueResponseDto,
} from '@js-heap-inspector-gateway/modules/metrics/application';
import {
  MetricRepository,
} from '@js-heap-inspector-gateway/modules/metrics/domain';
import {
  Injectable,
} from '@nestjs/common';

/**
 * Use case for fetching a metric.
 */
@Injectable()
export class FetchMetricUseCase implements UseCase<FetchMetricDto, MetricValueResponseDto, JwtPayload> {
  constructor(
    private readonly metricRepository: MetricRepository,
  ) {}

  /**
   * Executes the fetch process.
   *
   * @param {FetchMetricDto} dto - The fetch data.
   * @param context
   * @return {Promise<MetricValueResponseDto>} A promise that resolves to the metric value response.
   */
  public async execute(dto: FetchMetricDto, context: JwtPayload): Promise<MetricValueResponseDto> {
    const {id} = dto;

    // Fetch metric by ID
    const metric = await this.metricRepository.findById(id);
    if (!metric) {
      throw new Error('Metric not found.');
    }

    // Verify ownership
    if (metric.getUser().id !== context.user.id) {
      throw new Error('You do not have permission to access this metric.');
    }

    // Fetch value if exists
    const value = await this.metricRepository.getValue(id);

    if (!value) {
      throw new Error('Metric value not found.');
    }

    return {
      id: metric.id,
      name: metric.getName(),
      type: metric.getType(),
      value,
      size: value.length,
      creationDate: metric.getCreationDate(),
    };
  }
}
