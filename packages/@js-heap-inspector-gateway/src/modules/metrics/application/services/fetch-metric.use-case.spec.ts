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
  MetricValueServiceInterface,
} from '../interfaces/metric-value.service.interface';
import {
  FetchMetricDto,
} from '../dtos/fetch-metric.dto';
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
  FetchMetricUseCase,
} from './fetch-metric.use-case';

describe('FetchMetricUseCase', () => {
  let fetchMetricUseCase: FetchMetricUseCase;
  let mockMetricRepository: jest.Mocked<MetricRepository>;
  let mockMetricValueService: jest.Mocked<MetricValueServiceInterface>;

  beforeEach(() => {
    mockMetricRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updateName: jest.fn(),
    };

    mockMetricValueService = {
      saveValue: jest.fn(),
      getValue: jest.fn(),
      deleteValue: jest.fn(),
    };

    fetchMetricUseCase = new FetchMetricUseCase(
      mockMetricRepository,
      mockMetricValueService,
    );
  });

  describe('execute', () => {
    it('should return null if metric is not found', async () => {
      const dto: FetchMetricDto = {
        id: 'metric-123',
      };

      const userId = 'user-123';

      mockMetricRepository.findById.mockResolvedValue(undefined);

      const result = await fetchMetricUseCase.execute(dto, userId);

      expect(result).toBeNull();
      expect(mockMetricRepository.findById).toHaveBeenCalledWith('metric-123');
    });

    it('should throw an error if user does not own the metric', async () => {
      const dto: FetchMetricDto = {
        id: 'metric-123',
      };

      const userId = 'user-123';
      const otherUserId = 'user-456';

      const metric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: otherUserId,
        creationDate: new Date(),
      });

      mockMetricRepository.findById.mockResolvedValue(metric);

      await expect(fetchMetricUseCase.execute(dto, userId)).rejects.toThrow(
        'You do not have permission to access this metric.',
      );

      expect(mockMetricValueService.getValue).not.toHaveBeenCalled();
    });

    it('should return metric value if it exists', async () => {
      const dto: FetchMetricDto = {
        id: 'metric-123',
      };

      const userId = 'user-123';

      const metric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId,
        creationDate: new Date(),
      });

      const value = Buffer.from('test value');

      mockMetricRepository.findById.mockResolvedValue(metric);
      mockMetricValueService.getValue.mockResolvedValue(value);

      const result = await fetchMetricUseCase.execute(dto, userId);

      expect(result).toEqual({
        id: 'metric-123',
        name: 'memory-usage',
        type: 'MEMORY',
        value,
        size: value.length,
        creationDate: metric.getCreationDate(),
      });

      expect(mockMetricRepository.findById).toHaveBeenCalledWith('metric-123');
      expect(mockMetricValueService.getValue).toHaveBeenCalledWith('metric-123');
    });

    it('should return null if metric value does not exist', async () => {
      const dto: FetchMetricDto = {
        id: 'metric-123',
      };

      const userId = 'user-123';

      const metric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId,
        creationDate: new Date(),
      });

      mockMetricRepository.findById.mockResolvedValue(metric);
      mockMetricValueService.getValue.mockResolvedValue(null);

      const result = await fetchMetricUseCase.execute(dto, userId);

      expect(result).toBeNull();
    });
  });
});
