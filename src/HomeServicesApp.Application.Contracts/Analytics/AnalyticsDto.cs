using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Analytics
{
    public class DashboardAnalyticsDto
    {
        public UserAnalyticsDto UserAnalytics { get; set; }
        public OrderAnalyticsDto OrderAnalytics { get; set; }
        public RevenueAnalyticsDto RevenueAnalytics { get; set; }
        public ServiceAnalyticsDto ServiceAnalytics { get; set; }
        public ProviderAnalyticsDto ProviderAnalytics { get; set; }
        public List<ChartDataDto> Charts { get; set; } = new List<ChartDataDto>();
    }

    public class UserAnalyticsDto
    {
        public int TotalUsers { get; set; }
        public int NewUsersThisMonth { get; set; }
        public int ActiveUsersThisMonth { get; set; }
        public double UserRetentionRate { get; set; }
        public double CustomerSatisfactionScore { get; set; }
        public List<UserGrowthDto> UserGrowthData { get; set; } = new List<UserGrowthDto>();
    }

    public class OrderAnalyticsDto
    {
        public int TotalOrders { get; set; }
        public int OrdersThisMonth { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        public double OrderCompletionRate { get; set; }
        public double AverageOrderValue { get; set; }
        public List<OrderTrendDto> OrderTrends { get; set; } = new List<OrderTrendDto>();
    }

    public class RevenueAnalyticsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public decimal RevenueLastMonth { get; set; }
        public double RevenueGrowthRate { get; set; }
        public decimal AverageRevenuePerUser { get; set; }
        public List<RevenueBreakdownDto> RevenueBreakdown { get; set; } = new List<RevenueBreakdownDto>();
    }

    public class ServiceAnalyticsDto
    {
        public int TotalServices { get; set; }
        public int ActiveServices { get; set; }
        public List<PopularServiceDto> PopularServices { get; set; } = new List<PopularServiceDto>();
        public List<ServiceCategoryPerformanceDto> CategoryPerformance { get; set; } = new List<ServiceCategoryPerformanceDto>();
    }

    public class ProviderAnalyticsDto
    {
        public int TotalProviders { get; set; }
        public int ActiveProviders { get; set; }
        public int PendingApprovals { get; set; }
        public double AverageProviderRating { get; set; }
        public List<TopProviderDto> TopProviders { get; set; } = new List<TopProviderDto>();
    }

    public class ChartDataDto
    {
        public string ChartType { get; set; }
        public string Title { get; set; }
        public List<string> Labels { get; set; } = new List<string>();
        public List<ChartDatasetDto> Datasets { get; set; } = new List<ChartDatasetDto>();
    }

    public class ChartDatasetDto
    {
        public string Label { get; set; }
        public List<decimal> Data { get; set; } = new List<decimal>();
        public string BackgroundColor { get; set; }
        public string BorderColor { get; set; }
    }

    public class KpiDto
    {
        public string Name { get; set; }
        public string Value { get; set; }
        public string Change { get; set; }
        public string ChangeType { get; set; }
        public string Icon { get; set; }
        public string Color { get; set; }
    }

    public class UserGrowthDto
    {
        public DateTime Date { get; set; }
        public int NewUsers { get; set; }
        public int TotalUsers { get; set; }
    }

    public class OrderTrendDto
    {
        public DateTime Date { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
    }

    public class RevenueBreakdownDto
    {
        public string Category { get; set; }
        public decimal Amount { get; set; }
        public double Percentage { get; set; }
    }

    public class PopularServiceDto
    {
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; }
        public string Category { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
        public double AverageRating { get; set; }
    }

    public class ServiceCategoryPerformanceDto
    {
        public string Category { get; set; }
        public int ServiceCount { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
        public double AverageRating { get; set; }
    }

    public class TopProviderDto
    {
        public Guid ProviderId { get; set; }
        public string ProviderName { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
    }

    public class AnalyticsFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Category { get; set; }
        public Guid? ProviderId { get; set; }
        public string MetricType { get; set; }
        public string GroupBy { get; set; } = "day";
    }

    public class RealTimeMetricsDto
    {
        public int ActiveUsers { get; set; }
        public int OnlineProviders { get; set; }
        public int PendingOrders { get; set; }
        public int OrdersToday { get; set; }
        public decimal RevenueToday { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
