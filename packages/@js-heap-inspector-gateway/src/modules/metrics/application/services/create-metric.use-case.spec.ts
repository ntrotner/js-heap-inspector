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
  CreateMetricDto,
} from '../dtos/create-metric.dto';
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
  CreateMetricUseCase,
} from './create-metric.use-case';

describe('CreateMetricUseCase', () => {
  let createMetricUseCase: CreateMetricUseCase;
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

    createMetricUseCase = new CreateMetricUseCase(
      mockMetricRepository,
      mockMetricValueService,
    );
  });

  describe('execute', () => {
    it('should create a metric successfully', async () => {
      const dto: CreateMetricDto = {
        name: 'memory-usage',
        type: 'MEMORY',
      };

      const userId = 'user-123';

      mockMetricRepository.findByUserId.mockResolvedValue([]);

      const createdMetric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId,
        creationDate: new Date(),
      });

      mockMetricRepository.save.mockResolvedValue(createdMetric);

      const result = await createMetricUseCase.execute(dto, userId);

      expect(result).toEqual({
        id: 'metric-123',
        name: 'memory-usage',
        type: 'MEMORY',
        userId,
        creationDate: createdMetric.getCreationDate(),
      });

      expect(mockMetricRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockMetricRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: MetricName.create('memory-usage'),
          type: MetricType.create('MEMORY'),
          userId,
        }),
      );
    });

    it('should throw an error if a metric with the same name already exists', async () => {
      const dto: CreateMetricDto = {
        name: 'memory-usage',
        type: 'MEMORY',
      };

      const userId = 'user-123';

      const existingMetric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId,
        creationDate: new Date(),
      });

      mockMetricRepository.findByUserId.mockResolvedValue([existingMetric]);

      await expect(createMetricUseCase.execute(dto, userId)).rejects.toThrow(
        'A metric with this name already exists for the user.',
      );

      expect(mockMetricRepository.save).not.toHaveBeenCalled();
    });

    it('should save value if it exceeds 500MB threshold', async () => {
      const dto: CreateMetricDto = {
        name: 'large-metric',
        type: 'CUSTOM',
      };

      const userId = 'user-123';
      const largeValue = Buffer.alloc(600 * 1024 * 1024); // 600MB

      mockMetricRepository.findByUserId.mockResolvedValue([]);

      const createdMetric = new Metric({
        id: 'metric-123',
        name: MetricName.create('large-metric'),
        type: MetricType.create('CUSTOM'),
        userId,
        creationDate: new Date(),
      });

      mockMetricRepository.save.mockResolvedValue(createdMetric);

      await createMetricUseCase.execute(dto, userId);

      expect(mockMetricValueService.saveValue).toHaveBeenCalledWith(
        'metric-123',
        largeValue,
      );
    });
  });
});
