using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Orders;
using HomeServicesApp.Providers;
using HomeServicesApp.Services;
using HomeServicesApp.Reviews;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace HomeServicesApp.Dashboard
{
    [Authorize]
    public class DashboardAppService : ApplicationService, IDashboardAppService
    {
        private readonly IRepository<Order, Guid> _orderRepository;
        private readonly IRepository<Provider, Guid> _providerRepository;
        private readonly IRepository<Service, Guid> _serviceRepository;
        private readonly IRepository<Review, Guid> _reviewRepository;
        private readonly ICurrentUser _currentUser;

        public DashboardAppService(
            IRepository<Order, Guid> orderRepository,
            IRepository<Provider, Guid> providerRepository,
            IRepository<Service, Guid> serviceRepository,
            IRepository<Review, Guid> reviewRepository,
            ICurrentUser currentUser)
        {
            _orderRepository = orderRepository;
            _providerRepository = providerRepository;
            _serviceRepository = serviceRepository;
            _reviewRepository = reviewRepository;
            _currentUser = currentUser;
        }

        public async Task<CustomerDashboardDto> GetCustomerDashboardAsync()
        {
            var userId = _currentUser.GetId();
            var orders = await _orderRepository.GetListAsync(x => x.UserId == userId);
            var recentOrders = orders.OrderByDescending(o => o.CreationTime).Take(5).ToList();

            return new CustomerDashboardDto
            {
                TotalOrders = orders.Count,
                CompletedOrders = orders.Count(o => o.Status == OrderStatus.Completed),
                PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending),
                TotalSpent = orders.Where(o => o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice),
                RecentOrders = ObjectMapper.Map<List<Order>, List<OrderDto>>(recentOrders),
                FavoriteServices = new List<ServiceDto>()
            };
        }

        public async Task<ProviderDashboardDto> GetProviderDashboardAsync()
        {
            var userId = _currentUser.GetId();
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == userId);
            
            if (provider == null)
                return new ProviderDashboardDto();

            var orders = await _orderRepository.GetListAsync(x => x.ProviderId == provider.Id);
            var reviews = await _reviewRepository.GetListAsync(x => x.ProviderId == provider.Id);

            return new ProviderDashboardDto
            {
                TotalOrders = orders.Count,
                CompletedOrders = orders.Count(o => o.Status == OrderStatus.Completed),
                PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending),
                TotalEarnings = orders.Where(o => o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice),
                AverageRating = provider.AverageRating,
                TotalReviews = reviews.Count,
                WalletBalance = provider.WalletBalance,
                RecentOrders = ObjectMapper.Map<List<Order>, List<OrderDto>>(orders.OrderByDescending(o => o.CreationTime).Take(5).ToList())
            };
        }

        [Authorize("Admin")]
        public async Task<AdminDashboardDto> GetAdminDashboardAsync()
        {
            var totalOrders = await _orderRepository.CountAsync();
            var totalProviders = await _providerRepository.CountAsync();
            var totalServices = await _serviceRepository.CountAsync();
            var totalReviews = await _reviewRepository.CountAsync();

            var orders = await _orderRepository.GetListAsync();
            var providers = await _providerRepository.GetListAsync();

            return new AdminDashboardDto
            {
                TotalOrders = totalOrders,
                TotalProviders = totalProviders,
                TotalServices = totalServices,
                TotalReviews = totalReviews,
                PendingProviders = providers.Count(p => p.ApprovalStatus == "Pending"),
                ActiveProviders = providers.Count(p => p.ApprovalStatus == "Approved" && p.IsAvailable),
                TotalRevenue = orders.Where(o => o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice),
                MonthlyRevenue = orders.Where(o => o.Status == OrderStatus.Completed && o.CreationTime.Month == DateTime.Now.Month).Sum(o => o.TotalPrice)
            };
        }
    }

    public interface IDashboardAppService
    {
        Task<CustomerDashboardDto> GetCustomerDashboardAsync();
        Task<ProviderDashboardDto> GetProviderDashboardAsync();
        Task<AdminDashboardDto> GetAdminDashboardAsync();
    }

    public class CustomerDashboardDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal TotalSpent { get; set; }
        public List<OrderDto> RecentOrders { get; set; } = new();
        public List<ServiceDto> FavoriteServices { get; set; } = new();
    }

    public class ProviderDashboardDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal TotalEarnings { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public decimal WalletBalance { get; set; }
        public List<OrderDto> RecentOrders { get; set; } = new();
    }

    public class AdminDashboardDto
    {
        public int TotalOrders { get; set; }
        public int TotalProviders { get; set; }
        public int TotalServices { get; set; }
        public int TotalReviews { get; set; }
        public int PendingProviders { get; set; }
        public int ActiveProviders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }
}
