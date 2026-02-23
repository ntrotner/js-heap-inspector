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
  UpdateMetricNameDto,
} from '../dtos/update-metric-name.dto';
import {
  Metric,
} from '../../domain/entities/metric.entity';
import {
  MetricType,
} from '../../domain/value-objects/metric-type.value-object';
import {
  MetricName,
} from '../../domain/value-objects/metric-name.value-object';
import {
  UpdateMetricNameUseCase,
} from './update-metric-name.use-case';

describe('UpdateMetricNameUseCase', () => {
  let updateMetricNameUseCase: UpdateMetricNameUseCase;
  let mockMetricRepository: jest.Mocked<MetricRepository>;

  beforeEach(() => {
    mockMetricRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updateName: jest.fn(),
    };

    updateMetricNameUseCase = new UpdateMetricNameUseCase(mockMetricRepository);
  });

  describe('execute', () => {
    it('should update metric name successfully', async () => {
      const dto: UpdateMetricNameDto & {id: string} = {
        id: 'metric-123',
        name: 'cpu-usage',
      };

      const userId = 'user-123';

      const metric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId,
        creationDate: new Date(),
      });

      const updatedMetric = new Metric({
        id: 'metric-123',
        name: MetricName.create('cpu-usage'),
        type: MetricType.create('MEMORY'),
        userId,
        creationDate: new Date(),
      });

      mockMetricRepository.findById.mockResolvedValue(metric);
      mockMetricRepository.updateName.mockResolvedValue(updatedMetric);

      const result = await updateMetricNameUseCase.execute(dto, userId);

      expect(result).toEqual({
        id: 'metric-123',
        name: 'cpu-usage',
        type: 'MEMORY',
        userId,
        creationDate: updatedMetric.getCreationDate(),
      });

      expect(mockMetricRepository.findById).toHaveBeenCalledWith('metric-123');
      expect(mockMetricRepository.updateName).toHaveBeenCalledWith(
        'metric-123',
        MetricName.create('cpu-usage'),
      );
    });

    it('should throw an error if user does not own the metric', async () => {
      const dto: UpdateMetricNameDto & {id: string} = {
        id: 'metric-123',
        name: 'cpu-usage',
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

      await expect(updateMetricNameUseCase.execute(dto, userId)).rejects.toThrow(
        'You do not have permission to update this metric.',
      );

      expect(mockMetricRepository.updateName).not.toHaveBeenCalled();
    });

    it('should throw an error if metric is not found', async () => {
      const dto: UpdateMetricNameDto & {id: string} = {
        id: 'metric-123',
        name: 'cpu-usage',
      };

      const userId = 'user-123';

      mockMetricRepository.findById.mockResolvedValue(undefined);

      await expect(updateMetricNameUseCase.execute(dto, userId)).rejects.toThrow(
        'Metric not found.',
      );

      expect(mockMetricRepository.updateName).not.toHaveBeenCalled();
    });
  });
});
