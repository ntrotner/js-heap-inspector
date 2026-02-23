import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
} from '@jest/globals';
import {
  CreateMetricUseCase,
} from '../../application/services/create-metric.use-case';
import {
  FetchMetricUseCase,
} from '../../application/services/fetch-metric.use-case';
import {
  ListMetricsUseCase,
} from '../../application/services/list-metrics.use-case';
import {
  UpdateMetricNameUseCase,
} from '../../application/services/update-metric-name.use-case';
import {
  DeleteMetricUseCase,
} from '../../application/services/delete-metric.use-case';
import {
  CreateMetricDto,
} from '../../application/dtos/create-metric.dto';
import {
  FetchMetricDto,
} from '../../application/dtos/fetch-metric.dto';
import {
  ListMetricsDto,
} from '../../application/dtos/list-metrics.dto';
import {
  UpdateMetricNameDto,
} from '../../application/dtos/update-metric-name.dto';
import {
  MetricResponseDto,
} from '../../application/dtos/metric-response.dto';
import {
  MetricValueResponseDto,
} from '../../application/dtos/metric-value-response.dto';
import {
  MetricsController,
} from './metrics.controller';

describe('MetricsController', () => {
  let metricsController: MetricsController;
  let mockCreateMetricUseCase: jest.Mocked<CreateMetricUseCase>;
  let mockFetchMetricUseCase: jest.Mocked<FetchMetricUseCase>;
  let mockListMetricsUseCase: jest.Mocked<ListMetricsUseCase>;
  let mockUpdateMetricNameUseCase: jest.Mocked<UpdateMetricNameUseCase>;
  let mockDeleteMetricUseCase: jest.Mocked<DeleteMetricUseCase>;

  beforeEach(() => {
    mockCreateMetricUseCase = {
      execute: jest.fn(),
    };

    mockFetchMetricUseCase = {
      execute: jest.fn(),
    };

    mockListMetricsUseCase = {
      execute: jest.fn(),
    };

    mockUpdateMetricNameUseCase = {
      execute: jest.fn(),
    };

    mockDeleteMetricUseCase = {
      execute: jest.fn(),
    };

    metricsController = new MetricsController(
      mockCreateMetricUseCase,
      mockFetchMetricUseCase,
      mockListMetricsUseCase,
      mockUpdateMetricNameUseCase,
      mockDeleteMetricUseCase,
    );
  });

  describe('create', () => {
    it('should create a metric', async () => {
      const dto: CreateMetricDto = {
        name: 'memory-usage',
        type: 'MEMORY',
      };

      const user = {id: 'user-123'};

      const result: MetricResponseDto = {
        id: 'metric-123',
        name: 'memory-usage',
        type: 'MEMORY',
        userId: 'user-123',
        creationDate: new Date(),
      };

      mockCreateMetricUseCase.execute.mockResolvedValue(result);

      const response = await metricsController.create(dto, user);

      expect(response).toEqual(result);
      expect(mockCreateMetricUseCase.execute).toHaveBeenCalledWith(dto, 'user-123');
    });
  });

  describe('fetch', () => {
    it('should fetch a metric', async () => {
      const dto: FetchMetricDto = {
        id: 'metric-123',
      };

      const user = {id: 'user-123'};

      const result: MetricValueResponseDto = {
        id: 'metric-123',
        name: 'memory-usage',
        type: 'MEMORY',
        value: Buffer.from('test'),
        size: 4,
        creationDate: new Date(),
      };

      mockFetchMetricUseCase.execute.mockResolvedValue(result);

      const response = await metricsController.fetch(dto, user);

      expect(response).toEqual(result);
      expect(mockFetchMetricUseCase.execute).toHaveBeenCalledWith(dto, 'user-123');
    });

    it('should return null if metric is not found', async () => {
      const dto: FetchMetricDto = {
        id: 'metric-123',
      };

      const user = {id: 'user-123'};

      mockFetchMetricUseCase.execute.mockResolvedValue(null);

      const response = await metricsController.fetch(dto, user);

      expect(response).toBeNull();
    });
  });

  describe('list', () => {
    it('should list metrics', async () => {
      const user = {id: 'user-123'};

      const result: MetricResponseDto[] = [
        {
          id: 'metric-1',
          name: 'memory-usage',
          type: 'MEMORY',
          userId: 'user-123',
          creationDate: new Date(),
        },
        {
          id: 'metric-2',
          name: 'cpu-usage',
          type: 'CPU',
          userId: 'user-123',
          creationDate: new Date(),
        },
      ];

      mockListMetricsUseCase.execute.mockResolvedValue(result);

      const response = await metricsController.list(user);

      expect(response).toEqual(result);
      expect(mockListMetricsUseCase.execute).toHaveBeenCalledWith({userId: 'user-123'});
    });
  });

  describe('updateName', () => {
    it('should update metric name', async () => {
      const dto: FetchMetricDto & UpdateMetricNameDto = {
        id: 'metric-123',
        name: 'cpu-usage',
      };

      const user = {id: 'user-123'};

      const result: MetricResponseDto = {
        id: 'metric-123',
        name: 'cpu-usage',
        type: 'MEMORY',
        userId: 'user-123',
        creationDate: new Date(),
      };

      mockUpdateMetricNameUseCase.execute.mockResolvedValue(result);

      const response = await metricsController.updateName(dto, user);

      expect(response).toEqual(result);
      expect(mockUpdateMetricNameUseCase.execute).toHaveBeenCalledWith(dto, 'user-123');
    });
  });

  describe('delete', () => {
    it('should delete a metric', async () => {
      const dto: FetchMetricDto = {
        id: 'metric-123',
      };

      const user = {id: 'user-123'};

      mockDeleteMetricUseCase.execute.mockResolvedValue(undefined);

      await metricsController.delete(dto, user);

      expect(mockDeleteMetricUseCase.execute).toHaveBeenCalledWith(dto, 'user-123');
    });
  });
});
