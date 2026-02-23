import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  JwtPayload,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  MetricRepository,
} from '@js-heap-inspector-gateway/modules/metrics/domain';
import {
  MetricResponseDto,
} from '@js-heap-inspector-gateway/modules/metrics/application';
import {
  Injectable,
} from '@nestjs/common';
import {User} from "@js-heap-inspector-gateway/common/infrastructure/auth/domain";

/**
 * Use case for listing metrics.
 */
@Injectable()
export class ListMetricsUseCase implements UseCase<undefined, MetricResponseDto[], JwtPayload> {
  constructor(private readonly metricRepository: MetricRepository) {}

  /**
   * Executes the list process.
   *
   * @param {undefined} dto
   * @param context
   * @return {Promise<MetricResponseDto[]>} A promise that resolves to an array of metric responses.
   */
  public async execute(dto: undefined, context: JwtPayload): Promise<MetricResponseDto[]> {
    // Fetch all metrics for the user
    const metrics = await this.metricRepository.findByUserId(context.user.id);

    // Exclude values from the response
    return metrics.map(metric => ({
      id: metric.id,
      name: metric.getName(),
      type: metric.getType(),
      user: User.create({id: context.user.id}),
      creationDate: metric.getCreationDate(),
    }));
  }
}
