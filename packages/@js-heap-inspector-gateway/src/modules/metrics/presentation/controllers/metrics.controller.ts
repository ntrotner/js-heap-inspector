import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type {
  JwtPayload,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  JwtContextReviver,
  UserGuard,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/infrastructure';
import {
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateMetricDto,
  CreateMetricUseCase,
  DeleteMetricUseCase,
  FetchMetricDto,
  FetchMetricUseCase,
  ListMetricsUseCase,
  MetricResponseDto,
  MetricValueResponseDto,
  UpdateMetricNameDto,
  UpdateMetricNameUseCase,
} from '@js-heap-inspector-gateway/modules/metrics/application';

/**
 * Metrics controller for handling metric-related routes.
 */
@ApiBearerAuth()
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly createMetricUseCase: CreateMetricUseCase,
    private readonly fetchMetricUseCase: FetchMetricUseCase,
    private readonly listMetricsUseCase: ListMetricsUseCase,
    private readonly updateMetricNameUseCase: UpdateMetricNameUseCase,
    private readonly deleteMetricUseCase: DeleteMetricUseCase,
  ) {}

  /**
   * Creates a new metric.
   *
   * @param {CreateMetricDto} dto - The metric data.
   * @param jwtPayload
   * @return {Promise<MetricResponseDto>} A promise that resolves to the metric response.
   */
  @Post()
  @UseGuards(UserGuard)
  async create(
    @Body() dto: CreateMetricDto,
      @JwtContextReviver() jwtPayload: JwtPayload,
  ): Promise<MetricResponseDto> {
    return this.createMetricUseCase.execute(dto, jwtPayload);
  }

  /**
   * Fetches a metric by ID.
   *
   * @param {FetchMetricDto} dto - The fetch data.
   * @param jwtPayload
   * @return {Promise<MetricValueResponseDto | null>} A promise that resolves to the metric value response or null.
   */
  @Get()
  @UseGuards(UserGuard)
  async fetch(
    @Body() dto: FetchMetricDto,
      @JwtContextReviver() jwtPayload: JwtPayload,
  ): Promise<MetricValueResponseDto | undefined> {
    return this.fetchMetricUseCase.execute(dto, jwtPayload);
  }

  /**
   * Lists all metrics for the authenticated user.
   *
   * @return {Promise<MetricResponseDto[]>} A promise that resolves to an array of metric responses.
   * @param jwtPayload
   */
  @Get('list')
  @UseGuards(UserGuard)
  async list(@JwtContextReviver() jwtPayload: JwtPayload): Promise<MetricResponseDto[]> {
    return this.listMetricsUseCase.execute(undefined, jwtPayload);
  }

  /**
   * Updates the name of a metric.
   *
   * @param {FetchMetricDto & UpdateMetricNameDto} dto - The update data.
   * @param jwtPayload
   * @return {Promise<MetricResponseDto>} A promise that resolves to the updated metric response.
   */
  @Patch()
  @UseGuards(UserGuard)
  async updateName(
    @Body() dto: FetchMetricDto & UpdateMetricNameDto,
      @JwtContextReviver() jwtPayload: JwtPayload,
  ): Promise<MetricResponseDto> {
    return this.updateMetricNameUseCase.execute(dto, jwtPayload);
  }

  /**
   * Deletes a metric.
   *
   * @param {FetchMetricDto} dto - The delete data.
   * @param jwtPayload
   * @return {Promise<void>} A promise that resolves when the metric is deleted.
   */
  @Delete()
  @UseGuards(UserGuard)
  async delete(
    @Body() dto: FetchMetricDto,
      @JwtContextReviver() jwtPayload: JwtPayload,
  ): Promise<void> {
    return this.deleteMetricUseCase.execute(dto, jwtPayload);
  }
}
