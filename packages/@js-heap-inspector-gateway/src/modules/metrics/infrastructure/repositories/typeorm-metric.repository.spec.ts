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
  Metric,
} from '../../domain/entities/metric.entity';
import {
  MetricValue,
} from '../../domain/entities/metric-value.entity';
import {
  MetricName,
} from '../../domain/value-objects/metric-name.value-object';
import {
  MetricType,
} from '../../domain/value-objects/metric-type.value-object';
import {
  TypeOrmMetricRepository,
} from './typeorm-metric.repository';

describe('TypeOrmMetricRepository', () => {
  let typeOrmMetricRepository: TypeOrmMetricRepository;
  let mockMetricRepository: jest.Mocked<any>;
  let mockMetricValueRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockMetricRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockMetricValueRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    typeOrmMetricRepository = new TypeOrmMetricRepository(
      mockMetricRepository,
      mockMetricValueRepository,
    );
  });

  describe('findById', () => {
    it('should find a metric by ID', async () => {
      const metric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date(),
      });

      mockMetricRepository.findOne.mockResolvedValue(metric);

      const result = await typeOrmMetricRepository.findById('metric-123');

      expect(result).toEqual(metric);
      expect(mockMetricRepository.findOne).toHaveBeenCalledWith({
        where: {id: 'metric-123'},
        relations: ['user'],
      });
    });

    it('should return undefined if metric is not found', async () => {
      mockMetricRepository.findOne.mockResolvedValue(undefined);

      const result = await typeOrmMetricRepository.findById('metric-123');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should find all metrics for a user', async () => {
      const metrics = [
        new Metric({
          id: 'metric-1',
          name: MetricName.create('memory-usage'),
          type: MetricType.create('MEMORY'),
          userId: 'user-123',
          creationDate: new Date(),
        }),
        new Metric({
          id: 'metric-2',
          name: MetricName.create('cpu-usage'),
          type: MetricType.create('CPU'),
          userId: 'user-123',
          creationDate: new Date(),
        }),
      ];

      mockMetricRepository.find.mockResolvedValue(metrics);

      const result = await typeOrmMetricRepository.findByUserId('user-123');

      expect(result).toEqual(metrics);
      expect(mockMetricRepository.find).toHaveBeenCalledWith({
        where: {userId: 'user-123'},
        relations: ['user'],
      });
    });
  });

  describe('save', () => {
    it('should save a metric', async () => {
      const metric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date(),
      });

      mockMetricRepository.save.mockResolvedValue(metric);

      const result = await typeOrmMetricRepository.save(metric);

      expect(result).toEqual(metric);
      expect(mockMetricRepository.save).toHaveBeenCalledWith(metric);
    });
  });

  describe('delete', () => {
    it('should delete a metric', async () => {
      mockMetricRepository.delete.mockResolvedValue({affected: 1});

      await typeOrmMetricRepository.delete('metric-123');

      expect(mockMetricRepository.delete).toHaveBeenCalledWith('metric-123');
    });
  });

  describe('updateName', () => {
    it('should update the name of a metric', async () => {
      const metric = new Metric({
        id: 'metric-123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date(),
      });

      const updatedMetric = new Metric({
        id: 'metric-123',
        name: MetricName.create('cpu-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date(),
      });

      mockMetricRepository.findOne.mockResolvedValue(metric);
      mockMetricRepository.save.mockResolvedValue(updatedMetric);

      const result = await typeOrmMetricRepository.updateName(
        'metric-123',
        MetricName.create('cpu-usage'),
      );

      expect(result).toEqual(updatedMetric);
      expect(mockMetricRepository.findOne).toHaveBeenCalledWith({
        where: {id: 'metric-123'},
        relations: ['user'],
      });
      expect(mockMetricRepository.save).toHaveBeenCalledWith(updatedMetric);
    });

    it('should throw an error if metric is not found', async () => {
      mockMetricRepository.findOne.mockResolvedValue(undefined);

      await expect(
        typeOrmMetricRepository.updateName(
          'metric-123',
          MetricName.create('cpu-usage'),
        ),
      ).rejects.toThrow('Metric not found.');
    });
  });
});
