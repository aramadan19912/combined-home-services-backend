using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Orders;
using HomeServicesApp.Reviews;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace HomeServicesApp.Reports
{
    [Authorize("Admin")]
    public class ReportAppService : ApplicationService, IReportAppService
    {
        private readonly IRepository<Order, Guid> _orderRepository;
        private readonly IRepository<Review, Guid> _reviewRepository;

        public ReportAppService(IRepository<Order, Guid> orderRepository, IRepository<Review, Guid> reviewRepository)
        {
            _orderRepository = orderRepository;
            _reviewRepository = reviewRepository;
        }

        public async Task<ReportDto> GetDailyReportAsync(DateTime date)
        {
            var orders = await _orderRepository.GetListAsync(x => x.CreationTime.Date == date.Date);
            var reviews = await _reviewRepository.GetListAsync(x => x.CreationTime.Date == date.Date);
            return new ReportDto
            {
                OrdersCount = orders.Count,
                TotalRevenue = orders.Sum(x => x.TotalPrice),
                AverageRating = reviews.Any() ? reviews.Average(x => x.Rating) : 0
            };
        }

        public async Task<ReportDto> GetMonthlyReportAsync(int year, int month)
        {
            var orders = await _orderRepository.GetListAsync(x => x.CreationTime.Year == year && x.CreationTime.Month == month);
            var reviews = await _reviewRepository.GetListAsync(x => x.CreationTime.Year == year && x.CreationTime.Month == month);
            return new ReportDto
            {
                OrdersCount = orders.Count,
                TotalRevenue = orders.Sum(x => x.TotalPrice),
                AverageRating = reviews.Any() ? reviews.Average(x => x.Rating) : 0
            };
        }
    }

    public interface IReportAppService
    {
        Task<ReportDto> GetDailyReportAsync(DateTime date);
        Task<ReportDto> GetMonthlyReportAsync(int year, int month);
    }

    public class ReportDto
    {
        public int OrdersCount { get; set; }
        public decimal TotalRevenue { get; set; }
        public double AverageRating { get; set; }
    }
} 