using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.Orders;
using HomeServicesApp.Services;
using HomeServicesApp.Providers;
using HomeServicesApp.Reviews;
using Volo.Abp.Identity;
using Microsoft.AspNetCore.Authorization;

namespace HomeServicesApp.Analytics
{
    [Authorize]
    public class AnalyticsAppService : ApplicationService, IAnalyticsAppService
    {
        private readonly IRepository<Order, Guid> _orderRepository;
        private readonly IRepository<Service, Guid> _serviceRepository;
        private readonly IRepository<Provider, Guid> _providerRepository;
        private readonly IRepository<Review, Guid> _reviewRepository;
        private readonly IIdentityUserRepository _userRepository;

        public AnalyticsAppService(
            IRepository<Order, Guid> orderRepository,
            IRepository<Service, Guid> serviceRepository,
            IRepository<Provider, Guid> providerRepository,
            IRepository<Review, Guid> reviewRepository,
            IIdentityUserRepository userRepository)
        {
            _orderRepository = orderRepository;
            _serviceRepository = serviceRepository;
            _providerRepository = providerRepository;
            _reviewRepository = reviewRepository;
            _userRepository = userRepository;
        }

        public async Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(AnalyticsFilterDto filter)
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-1);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var userAnalytics = await GetUserAnalyticsAsync(filter);
            var orderAnalytics = await GetOrderAnalyticsAsync(filter);
            var revenueAnalytics = await GetRevenueAnalyticsAsync(filter);
            var serviceAnalytics = await GetServiceAnalyticsAsync(filter);
            var providerAnalytics = await GetProviderAnalyticsAsync(filter);

            var charts = new List<ChartDataDto>
            {
                new ChartDataDto
                {
                    ChartType = "line",
                    Title = "Order Trends",
                    Labels = orderAnalytics.OrderTrends.Select(t => t.Date.ToString("MMM dd")).ToList(),
                    Datasets = new List<ChartDatasetDto>
                    {
                        new ChartDatasetDto
                        {
                            Label = "Orders",
                            Data = orderAnalytics.OrderTrends.Select(t => (decimal)t.OrderCount).ToList(),
                            BackgroundColor = "#4CAF50",
                            BorderColor = "#4CAF50"
                        }
                    }
                },
                new ChartDataDto
                {
                    ChartType = "bar",
                    Title = "Revenue by Category",
                    Labels = revenueAnalytics.RevenueBreakdown.Select(r => r.Category).ToList(),
                    Datasets = new List<ChartDatasetDto>
                    {
                        new ChartDatasetDto
                        {
                            Label = "Revenue",
                            Data = revenueAnalytics.RevenueBreakdown.Select(r => r.Amount).ToList(),
                            BackgroundColor = "#2196F3",
                            BorderColor = "#2196F3"
                        }
                    }
                }
            };

            return new DashboardAnalyticsDto
            {
                UserAnalytics = userAnalytics,
                OrderAnalytics = orderAnalytics,
                RevenueAnalytics = revenueAnalytics,
                ServiceAnalytics = serviceAnalytics,
                ProviderAnalytics = providerAnalytics,
                Charts = charts
            };
        }

        public async Task<UserAnalyticsDto> GetUserAnalyticsAsync(AnalyticsFilterDto filter)
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-1);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var totalUsers = (int)await _userRepository.GetCountAsync();
            var allUsers = await _userRepository.GetListAsync();
            var newUsersThisMonth = allUsers.Count(u => u.CreationTime >= startDate && u.CreationTime <= endDate);
            
            var activeUserIds = await _orderRepository.GetQueryableAsync();
            var activeUsersThisMonth = (int)activeUserIds
                .Where(o => o.CreationTime >= startDate && o.CreationTime <= endDate)
                .Select(o => o.UserId)
                .Distinct()
                .Count();

            var reviews = await _reviewRepository.GetListAsync();
            var avgRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;
            var retentionRate = totalUsers > 0 ? (double)activeUsersThisMonth / totalUsers * 100 : 0;

            return new UserAnalyticsDto
            {
                TotalUsers = totalUsers,
                NewUsersThisMonth = newUsersThisMonth,
                ActiveUsersThisMonth = activeUsersThisMonth,
                UserRetentionRate = retentionRate,
                CustomerSatisfactionScore = avgRating,
                UserGrowthData = await GenerateRealUserGrowthData(startDate, endDate)
            };
        }

        public async Task<OrderAnalyticsDto> GetOrderAnalyticsAsync(AnalyticsFilterDto filter)
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-1);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var orders = await _orderRepository.GetListAsync();
            var filteredOrders = orders.Where(o => o.CreationTime >= startDate && o.CreationTime <= endDate).ToList();

            var totalOrders = orders.Count;
            var ordersThisMonth = filteredOrders.Count;
            var completedOrders = orders.Count(o => o.Status == OrderStatus.Completed);
            var cancelledOrders = orders.Count(o => o.Status == OrderStatus.Cancelled);

            return new OrderAnalyticsDto
            {
                TotalOrders = totalOrders,
                OrdersThisMonth = ordersThisMonth,
                CompletedOrders = completedOrders,
                CancelledOrders = cancelledOrders,
                OrderCompletionRate = totalOrders > 0 ? (double)completedOrders / totalOrders * 100 : 0,
                AverageOrderValue = filteredOrders.Any() ? (double)filteredOrders.Average(o => o.TotalPrice) : 0,
                OrderTrends = GenerateOrderTrends(startDate, endDate, filteredOrders)
            };
        }

        public async Task<RevenueAnalyticsDto> GetRevenueAnalyticsAsync(AnalyticsFilterDto filter)
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-1);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var orders = await _orderRepository.GetListAsync();
            var completedOrders = orders.Where(o => o.Status == OrderStatus.Completed).ToList();
            var thisMonthOrders = completedOrders.Where(o => o.CreationTime >= startDate && o.CreationTime <= endDate).ToList();
            var lastMonthOrders = completedOrders.Where(o => o.CreationTime >= startDate.AddMonths(-1) && o.CreationTime < startDate).ToList();

            var totalRevenue = completedOrders.Sum(o => o.TotalPrice);
            var revenueThisMonth = thisMonthOrders.Sum(o => o.TotalPrice);
            var revenueLastMonth = lastMonthOrders.Sum(o => o.TotalPrice);

            return new RevenueAnalyticsDto
            {
                TotalRevenue = totalRevenue,
                RevenueThisMonth = revenueThisMonth,
                RevenueLastMonth = revenueLastMonth,
                RevenueGrowthRate = revenueLastMonth > 0 ? (double)((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0,
                AverageRevenuePerUser = completedOrders.Any() ? totalRevenue / completedOrders.GroupBy(o => o.UserId).Count() : 0,
                RevenueBreakdown = await GenerateRevenueBreakdown(completedOrders)
            };
        }

        public async Task<ServiceAnalyticsDto> GetServiceAnalyticsAsync(AnalyticsFilterDto filter)
        {
            var services = await _serviceRepository.GetListAsync();
            var orders = await _orderRepository.GetListAsync();

            var activeServices = services.Count(s => s.IsActive);
            var popularServices = new List<PopularServiceDto>();
            var topServices = services
                .OrderByDescending(s => orders.Count(o => o.ServiceId == s.Id))
                .Take(10);
                
            foreach (var s in topServices)
            {
                popularServices.Add(new PopularServiceDto
                {
                    ServiceId = s.Id,
                    ServiceName = s.Name,
                    Category = s.Category,
                    OrderCount = orders.Count(o => o.ServiceId == s.Id),
                    Revenue = orders.Where(o => o.ServiceId == s.Id && o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice),
                    AverageRating = orders.Where(o => o.ServiceId == s.Id).Any() ? 
                        await CalculateServiceAverageRating(s.Id) : 0
                });
            }

            var categoryPerformance = new List<ServiceCategoryPerformanceDto>();
            var categoryGroups = services.GroupBy(s => s.Category);
            
            foreach (var g in categoryGroups)
            {
                categoryPerformance.Add(new ServiceCategoryPerformanceDto
                {
                    Category = g.Key,
                    ServiceCount = g.Count(),
                    OrderCount = orders.Count(o => g.Any(s => s.Id == o.ServiceId)),
                    Revenue = orders.Where(o => g.Any(s => s.Id == o.ServiceId) && o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice),
                    AverageRating = await CalculateCategoryAverageRating(g.Key)
                });
            }

            return new ServiceAnalyticsDto
            {
                TotalServices = services.Count,
                ActiveServices = activeServices,
                PopularServices = popularServices,
                CategoryPerformance = categoryPerformance
            };
        }

        public async Task<ProviderAnalyticsDto> GetProviderAnalyticsAsync(AnalyticsFilterDto filter)
        {
            var providers = await _providerRepository.GetListAsync();
            var orders = await _orderRepository.GetListAsync();

            var activeProviders = providers.Count(p => p.IsAvailable);
            var pendingApprovals = providers.Count(p => p.ApprovalStatus == "Pending");

            var topProviders = providers
                .Select(p => new TopProviderDto
                {
                    ProviderId = p.Id,
                    ProviderName = p.Specialization,
                    OrderCount = orders.Count(o => o.ProviderId == p.Id),
                    Revenue = orders.Where(o => o.ProviderId == p.Id && o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice),
                    AverageRating = p.AverageRating,
                    ReviewCount = p.TotalOrders
                })
                .OrderByDescending(p => p.Revenue)
                .Take(10)
                .ToList();

            return new ProviderAnalyticsDto
            {
                TotalProviders = providers.Count,
                ActiveProviders = activeProviders,
                PendingApprovals = pendingApprovals,
                AverageProviderRating = providers.Any() ? providers.Average(p => p.AverageRating) : 0,
                TopProviders = topProviders
            };
        }

        public async Task<RealTimeMetricsDto> GetRealTimeMetricsAsync()
        {
            var today = DateTime.UtcNow.Date;
            var orders = await _orderRepository.GetListAsync();
            var todayOrders = orders.Where(o => o.CreationTime.Date == today).ToList();
            
            var allProviders = await _providerRepository.GetListAsync();
            var activeProviders = allProviders.Count(p => p.IsAvailable && p.ApprovalStatus == "Approved");
            
            var activeUserIds = await _orderRepository.GetQueryableAsync();
            var activeUsers = activeUserIds
                .Where(o => o.CreationTime >= DateTime.UtcNow.AddHours(-24))
                .Select(o => o.UserId)
                .Distinct()
                .Count();

            return new RealTimeMetricsDto
            {
                ActiveUsers = activeUsers,
                OnlineProviders = activeProviders,
                PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending),
                OrdersToday = todayOrders.Count,
                RevenueToday = todayOrders.Where(o => o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice),
                LastUpdated = DateTime.UtcNow
            };
        }

        private async Task<List<UserGrowthDto>> GenerateRealUserGrowthData(DateTime startDate, DateTime endDate)
        {
            var data = new List<UserGrowthDto>();
            var current = startDate;
            var allUsers = await _userRepository.GetListAsync();

            while (current <= endDate)
            {
                var dayEnd = current.AddDays(1);
                var newUsers = allUsers.Count(u => u.CreationTime >= current && u.CreationTime < dayEnd);
                var totalUsers = allUsers.Count(u => u.CreationTime <= dayEnd);

                data.Add(new UserGrowthDto
                {
                    Date = current,
                    NewUsers = newUsers,
                    TotalUsers = totalUsers
                });

                current = current.AddDays(1);
            }

            return data;
        }

        private async Task<double> CalculateServiceAverageRating(Guid serviceId)
        {
            var reviews = await _reviewRepository.GetListAsync(r => r.ServiceId == serviceId);
            return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
        }

        private async Task<double> CalculateCategoryAverageRating(string category)
        {
            var services = await _serviceRepository.GetListAsync(s => s.Category == category);
            var serviceIds = services.Select(s => s.Id).ToList();
            var reviews = await _reviewRepository.GetListAsync(r => serviceIds.Contains(r.ServiceId ?? Guid.Empty));
            return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
        }

        private List<OrderTrendDto> GenerateOrderTrends(DateTime startDate, DateTime endDate, List<Order> orders)
        {
            var trends = new List<OrderTrendDto>();
            var current = startDate;

            while (current <= endDate)
            {
                var dayOrders = orders.Where(o => o.CreationTime.Date == current.Date).ToList();

                trends.Add(new OrderTrendDto
                {
                    Date = current,
                    OrderCount = dayOrders.Count,
                    Revenue = dayOrders.Where(o => o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice)
                });

                current = current.AddDays(1);
            }

            return trends;
        }

        private async Task<List<RevenueBreakdownDto>> GenerateRevenueBreakdown(List<Order> orders)
        {
            var totalRevenue = orders.Sum(o => o.TotalPrice);
            if (totalRevenue == 0) return new List<RevenueBreakdownDto>();

            var services = await _serviceRepository.GetListAsync();
            var breakdown = services
                .GroupBy(s => s.Category)
                .Select(g => new RevenueBreakdownDto
                {
                    Category = g.Key,
                    Amount = orders
                        .Where(o => g.Any(s => s.Id == o.ServiceId) && o.Status == OrderStatus.Completed)
                        .Sum(o => o.TotalPrice),
                    Percentage = 0
                })
                .Where(r => r.Amount > 0)
                .ToList();

            foreach (var item in breakdown)
            {
                item.Percentage = totalRevenue > 0 ? (int)Math.Round((item.Amount / totalRevenue) * 100) : 0;
            }

            return breakdown.OrderByDescending(r => r.Amount).ToList();
        }
    }
}
