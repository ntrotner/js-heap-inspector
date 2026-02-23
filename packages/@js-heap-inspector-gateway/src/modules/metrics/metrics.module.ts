import {
  Module,
} from '@nestjs/common';
import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import {
  Metric,
  MetricRepository,
  MetricValue,
} from '@js-heap-inspector-gateway/modules/metrics/domain';
import {
  TypeOrmMetricRepository,
} from '@js-heap-inspector-gateway/modules/metrics/infrastructure';
import {
  CreateMetricUseCase,
  DeleteMetricUseCase,
  FetchMetricUseCase,
  ListMetricsUseCase,
  UpdateMetricNameUseCase,
} from '@js-heap-inspector-gateway/modules/metrics/application';
import {
  MetricsController,
} from '@js-heap-inspector-gateway/modules/metrics/presentation';

/**
 * Metrics module for handling metric-related functionality.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Metric, MetricValue]),
  ],
  providers: [
    {
      provide: MetricRepository,
      useExisting: TypeOrmMetricRepository,
    },
    TypeOrmMetricRepository,
    CreateMetricUseCase,
    FetchMetricUseCase,
    ListMetricsUseCase,
    UpdateMetricNameUseCase,
    DeleteMetricUseCase,
  ],
  exports: [],
  controllers: [MetricsController],
})
export class MetricsModule {}
