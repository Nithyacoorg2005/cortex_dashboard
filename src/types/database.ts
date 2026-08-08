export interface CloudWatchAlert {
  AlarmName: string;
  NewStateValue: string;
  StateChangeTime: string;
  Trigger: {
    MetricName: string;
    Namespace: string;
    Dimensions: Array<{ name: string; value: string }>;
  };
}