import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  JwtPayload,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  MetricResponseDto,
  UpdateMetricNameDto,
} from '@js-heap-inspector-gateway/modules/metrics/application';
import {
  MetricName,
  MetricRepository,
} from '@js-heap-inspector-gateway/modules/metrics/domain';
import {
  Injectable,
} from '@nestjs/common';

/**
 * Use case for updating a metric name.
 */
@Injectable()
export class UpdateMetricNameUseCase implements UseCase<UpdateMetricNameDto, MetricResponseDto, JwtPayload> {
  constructor(private readonly metricRepository: MetricRepository) {}

  /**
   * Executes the update process.
   *
   * @param {UpdateMetricNameDto & {id: string}} dto - The update data.
   * @param context
   * @return {Promise<MetricResponseDto>} A promise that resolves to the updated metric response.
   */
  public async execute(dto: UpdateMetricNameDto, context: JwtPayload): Promise<MetricResponseDto> {
    const {name} = dto;

    // Create new metric name value object
    const newMetricName = MetricName.create(name);

    // Update metric name
    const updatedMetric = await this.metricRepository.updateName(
      dto.id,
      newMetricName,
    );

    // Verify ownership
    if (updatedMetric.getUser().id !== context.user.id) {
      throw new Error('You do not have permission to update this metric.');
    }

    return {
      id: updatedMetric.id,
      name: updatedMetric.getName(),
      type: updatedMetric.getType(),
      creationDate: updatedMetric.getCreationDate(),
    };
  }
}
