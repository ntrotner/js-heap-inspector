import {
  describe,
  it,
  expect,
} from '@jest/globals';
import {
  MetricName,
} from '../value-objects/metric-name.value-object';
import {
  MetricType,
} from '../value-objects/metric-type.value-object';
import {
  Metric,
} from './metric.entity';

describe('Metric', () => {
  describe('constructor', () => {
    it('should create a new metric', () => {
      const metric = new Metric({
        id: '123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date('2024-01-01'),
      });

      expect(metric.id).toBe('123');
      expect(metric.getName()).toBe('memory-usage');
      expect(metric.getType()).toBe('MEMORY');
      expect(metric.getUserId()).toBe('user-123');
      expect(metric.getCreationDate()).toEqual(new Date('2024-01-01'));
    });
  });

  describe('setName', () => {
    it('should update the metric name', () => {
      const metric = new Metric({
        id: '123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date('2024-01-01'),
      });

      metric.setName(MetricName.create('cpu-usage'));
      expect(metric.getName()).toBe('cpu-usage');
    });
  });

  describe('setType', () => {
    it('should update the metric type', () => {
      const metric = new Metric({
        id: '123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date('2024-01-01'),
      });

      metric.setType(MetricType.create('CPU'));
      expect(metric.getType()).toBe('CPU');
    });
  });

  describe('getUserId', () => {
    it('should return the user ID', () => {
      const metric = new Metric({
        id: '123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date('2024-01-01'),
      });

      expect(metric.getUserId()).toBe('user-123');
    });
  });

  describe('getName', () => {
    it('should return the metric name', () => {
      const metric = new Metric({
        id: '123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date('2024-01-01'),
      });

      expect(metric.getName()).toBe('memory-usage');
    });
  });

  describe('getType', () => {
    it('should return the metric type', () => {
      const metric = new Metric({
        id: '123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: new Date('2024-01-01'),
      });

      expect(metric.getType()).toBe('MEMORY');
    });
  });

  describe('getCreationDate', () => {
    it('should return the creation date', () => {
      const date = new Date('2024-01-01');
      const metric = new Metric({
        id: '123',
        name: MetricName.create('memory-usage'),
        type: MetricType.create('MEMORY'),
        userId: 'user-123',
        creationDate: date,
      });

      expect(metric.getCreationDate()).toEqual(date);
    });
  });
});
