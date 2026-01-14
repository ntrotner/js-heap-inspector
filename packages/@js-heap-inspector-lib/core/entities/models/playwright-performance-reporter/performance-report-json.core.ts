export type TestCase = {
  endMeasurement: number;
  name: string;
  samplingMetrics: LifecycleMetric[];
  startMeasurement: number;
  startMeasurementOffset: number;
  startMetrics: LifecycleMetric[];
  stopMetrics: LifecycleMetric[];
};

export type LifecycleMetric = {
  description: string;
  devtoolsFrontendUrl: string;
  id: string;
  metric: PlaywrightPerformanceMetric;
  title: string;
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
};

export type PlaywrightPerformanceMetric = {
  heapObjectsTracking: string;
};

export type PerformanceReportJson = Array<Record<string, Record<string, TestCase>>>;
