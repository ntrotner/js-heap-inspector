import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  JwtPayload,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  Injectable,
} from '@nestjs/common';
import {
  CreateMetricDto,
  MetricResponseDto,
} from '@js-heap-inspector-gateway/modules/metrics/application';
import {
  Metric,
  MetricName,
  MetricRepository,
  MetricType,
  MetricTypeEnum,
} from '@js-heap-inspector-gateway/modules/metrics/domain';
import {User} from "@js-heap-inspector-gateway/common/infrastructure/auth/domain";
import {randomUUID} from "node:crypto";

/**
 * Use case for creating a new metric.
 */
@Injectable()
export class CreateMetricUseCase implements UseCase<CreateMetricDto, MetricResponseDto, JwtPayload> {
  constructor(
    private readonly metricRepository: MetricRepository,
  ) {}

  /**
   * Executes the creation process.
   *
   * @param {CreateMetricDto} dto - The creation data.
   * @param context
   * @return {Promise<MetricResponseDto>} A promise that resolves to the metric response.
   */
  public async execute(dto: CreateMetricDto, context: JwtPayload): Promise<MetricResponseDto> {
    const {name, type} = dto;

    // Check if a metric with the same name already exists for the user
    const existingMetrics = await this.metricRepository.findByUserId(context.user.id);
    const nameExists = existingMetrics.some(metric => metric.getName() === name);
    if (nameExists) {
      throw new Error('A metric with this name already exists for the user.');
    }

    const isAllowedMetric = (Object.values(MetricTypeEnum) as string[]).includes(type);
    if (!isAllowedMetric) {
      throw new Error('Invalid metric type.');
    }

    // Create metric entity
    const metric = Metric.create({
      id: randomUUID(),
      name: MetricName.create(name),
      type: MetricType.create(type),
      user: User.create({id: context.user.id}),
      creationDate: new Date(),
    });

    // Save metric
    const savedMetric = await this.metricRepository.save(metric);
    if (!savedMetric) {
      throw new Error('Failed to save metric.');
    }
    
    const bufferValue = Buffer.from(dto.value);
    await this.metricRepository.saveValue(savedMetric.id, bufferValue);
    
    return {
      id: savedMetric.id,
      name: savedMetric.getName(),
      type: savedMetric.getType(),
      creationDate: savedMetric.getCreationDate(),
    };
  }
}
