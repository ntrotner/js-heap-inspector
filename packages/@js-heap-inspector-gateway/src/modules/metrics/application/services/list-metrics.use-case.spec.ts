import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
} from '@jest/globals';
import {
  MetricRepository,
} from '../../domain/repositories/metric.repository.interface';
import {
  ListMetricsDto,
} from '../dtos/list-metrics.dto';
import {
  Metric,
} from '../../domain/entities/metric.entity';
import {
  MetricName,
} from '../../domain/value-objects/metric-name.value-object';
import {
  MetricType,
} from '../../domain/value-objects/metric-type.value-object';
import {
  ListMetricsUseCase,
} from './list-metrics.use-case';

describe('ListMetricsUseCase', () => {
  let listMetricsUseCase: ListMetricsUseCase;
  let mockMetricRepository: jest.Mocked<MetricRepository>;

  beforeEach(() => {
    mockMetricRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updateName: jest.fn(),
    };

    listMetricsUseCase = new ListMetricsUseCase(mockMetricRepository);
  });

  describe('execute', () => {
    it('should return all metrics for the user', async () => {
      const dto: ListMetricsDto = {
        userId: 'user-123',
      };

      const metrics = [
        new Metric({
          id: 'metric-1',
          name: MetricName.create('memory-usage'),
          type: MetricType.create('MEMORY'),
          userId: 'user-123',
          creationDate: new Date('2024-01-01'),
        }),
        new Metric({
          id: 'metric-2',
          name: MetricName.create('cpu-usage'),
          type: MetricType.create('CPU'),
          userId: 'user-123',
          creationDate: new Date('2024-01-02'),
        }),
      ];

      mockMetricRepository.findByUserId.mockResolvedValue(metrics);

      const result = await listMetricsUseCase.execute(dto);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'metric-1',
        name: 'memory-usage',
        type: 'MEMORY',
        userId: 'user-123',
        creationDate: metrics[0].getCreationDate(),
      });
      expect(result[1]).toEqual({
        id: 'metric-2',
        name: 'cpu-usage',
        type: 'CPU',
        userId: 'user-123',
        creationDate: metrics[1].getCreationDate(),
      });

      expect(mockMetricRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array if user has no metrics', async () => {
      const dto: ListMetricsDto = {
        userId: 'user-123',
      };

      mockMetricRepository.findByUserId.mockResolvedValue([]);

      const result = await listMetricsUseCase.execute(dto);

      expect(result).toEqual([]);
    });
  });
});
