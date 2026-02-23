import {
  describe,
  it,
  expect,
} from '@jest/globals';
import {
  MetricName,
} from './metric-name.value-object';

describe('MetricName', () => {
  describe('create', () => {
    it('should create a valid metric name', () => {
      const metricName = MetricName.create('memory-usage');

      expect(metricName.getValue()).toBe('memory-usage');
    });

    it('should throw an error for empty name', () => {
      expect(() => MetricName.create('')).toThrow(
        'Metric name must be between 1 and 255 characters long.',
      );
    });

    it('should throw an error for name that is too short', () => {
      expect(() => MetricName.create('a')).toThrow(
        'Metric name must be between 1 and 255 characters long.',
      );
    });

    it('should throw an error for name that is too long', () => {
      const longName = 'a'.repeat(256);
      expect(() => MetricName.create(longName)).toThrow(
        'Metric name must be between 1 and 255 characters long.',
      );
    });
  });

  describe('getValue', () => {
    it('should return the metric name value', () => {
      const metricName = MetricName.create('test-metric');
      expect(metricName.getValue()).toBe('test-metric');
    });
  });
});
