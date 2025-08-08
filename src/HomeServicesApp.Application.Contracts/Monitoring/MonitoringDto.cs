using System;
using System.Collections.Generic;

namespace HomeServicesApp.Monitoring
{
    public class SystemHealthDto
    {
        public string Status { get; set; }
        public DateTime CheckedAt { get; set; }
        public List<HealthCheckDto> Checks { get; set; } = new List<HealthCheckDto>();
        public SystemMetricsDto Metrics { get; set; }
        public List<AlertDto> ActiveAlerts { get; set; } = new List<AlertDto>();
    }

    public class HealthCheckDto
    {
        public string Name { get; set; }
        public string Status { get; set; }
        public string Description { get; set; }
        public TimeSpan ResponseTime { get; set; }
        public Dictionary<string, object> Data { get; set; } = new Dictionary<string, object>();
    }

    public class SystemMetricsDto
    {
        public double CpuUsage { get; set; }
        public double MemoryUsage { get; set; }
        public double DiskUsage { get; set; }
        public int ActiveConnections { get; set; }
        public double AverageResponseTime { get; set; }
        public int RequestsPerMinute { get; set; }
        public int ErrorRate { get; set; }
        public double Uptime { get; set; }
    }

    public class AlertDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
        public string Severity { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public bool IsResolved { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }

    public class PerformanceMetricsDto
    {
        public List<MetricDataPointDto> CpuUsage { get; set; } = new List<MetricDataPointDto>();
        public List<MetricDataPointDto> MemoryUsage { get; set; } = new List<MetricDataPointDto>();
        public List<MetricDataPointDto> ResponseTimes { get; set; } = new List<MetricDataPointDto>();
        public List<MetricDataPointDto> RequestCounts { get; set; } = new List<MetricDataPointDto>();
        public List<MetricDataPointDto> ErrorRates { get; set; } = new List<MetricDataPointDto>();
    }

    public class MetricDataPointDto
    {
        public DateTime Timestamp { get; set; }
        public double Value { get; set; }
        public string Label { get; set; }
    }

    public class DatabaseMetricsDto
    {
        public int ActiveConnections { get; set; }
        public double AverageQueryTime { get; set; }
        public int SlowQueries { get; set; }
        public long DatabaseSize { get; set; }
        public double CacheHitRatio { get; set; }
        public List<SlowQueryDto> TopSlowQueries { get; set; } = new List<SlowQueryDto>();
    }

    public class SlowQueryDto
    {
        public string Query { get; set; }
        public double AverageTime { get; set; }
        public int ExecutionCount { get; set; }
        public DateTime LastExecuted { get; set; }
    }

    public class SecurityMetricsDto
    {
        public int FailedLoginAttempts { get; set; }
        public int BlockedIpAddresses { get; set; }
        public int SuspiciousActivities { get; set; }
        public List<SecurityEventDto> RecentEvents { get; set; } = new List<SecurityEventDto>();
    }

    public class SecurityEventDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
        public string Severity { get; set; }
        public string Description { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public DateTime OccurredAt { get; set; }
        public Dictionary<string, object> Details { get; set; } = new Dictionary<string, object>();
    }

    public class LogAnalyticsDto
    {
        public int TotalLogs { get; set; }
        public int ErrorLogs { get; set; }
        public int WarningLogs { get; set; }
        public int InfoLogs { get; set; }
        public List<LogTrendDto> LogTrends { get; set; } = new List<LogTrendDto>();
        public List<ErrorSummaryDto> TopErrors { get; set; } = new List<ErrorSummaryDto>();
    }

    public class LogTrendDto
    {
        public DateTime Timestamp { get; set; }
        public int ErrorCount { get; set; }
        public int WarningCount { get; set; }
        public int InfoCount { get; set; }
    }

    public class ErrorSummaryDto
    {
        public string ErrorType { get; set; }
        public string Message { get; set; }
        public int Count { get; set; }
        public DateTime LastOccurred { get; set; }
        public string StackTrace { get; set; }
    }

    public class MonitoringConfigDto
    {
        public int HealthCheckInterval { get; set; }
        public int MetricsRetentionDays { get; set; }
        public List<AlertRuleDto> AlertRules { get; set; } = new List<AlertRuleDto>();
        public List<string> NotificationChannels { get; set; } = new List<string>();
    }

    public class AlertRuleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string MetricName { get; set; }
        public string Operator { get; set; }
        public double Threshold { get; set; }
        public int Duration { get; set; }
        public string Severity { get; set; }
        public bool IsEnabled { get; set; }
        public List<string> NotificationChannels { get; set; } = new List<string>();
    }
}
