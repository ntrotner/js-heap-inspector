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
  DeleteMetricUseCase,
} from './delete-metric.use-case';

describe('DeleteMetricUseCase', () => {
  let deleteMetricUseCase: DeleteMetricUseCase;
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

    deleteMetricUseCase = new DeleteMetricUseCase(
      mockMetricRepository,
      mockMetricValueService,
    );
  });

  describe('execute', () => {
    it('should delete metric successfully', async () => {
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

      await deleteMetricUseCase.execute(dto, userId);

      expect(mockMetricRepository.findById).toHaveBeenCalledWith('metric-123');
      expect(mockMetricValueService.deleteValue).toHaveBeenCalledWith('metric-123');
      expect(mockMetricRepository.delete).toHaveBeenCalledWith('metric-123');
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

      await expect(deleteMetricUseCase.execute(dto, userId)).rejects.toThrow(
        'You do not have permission to delete this metric.',
      );

      expect(mockMetricRepository.delete).not.toHaveBeenCalled();
      expect(mockMetricValueService.deleteValue).not.toHaveBeenCalled();
    });

    it('should throw an error if metric is not found', async () => {
      const dto: FetchMetricDto = {
        id: 'metric-123',
      };

      const userId = 'user-123';

      mockMetricRepository.findById.mockResolvedValue(undefined);

      await expect(deleteMetricUseCase.execute(dto, userId)).rejects.toThrow(
        'Metric not found.',
      );

      expect(mockMetricRepository.delete).not.toHaveBeenCalled();
      expect(mockMetricValueService.deleteValue).not.toHaveBeenCalled();
    });

    it('should delete metric value if it exists', async () => {
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

      await deleteMetricUseCase.execute(dto, userId);

      expect(mockMetricValueService.deleteValue).toHaveBeenCalledWith('metric-123');
    });
  });
});
