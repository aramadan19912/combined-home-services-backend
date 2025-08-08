using System;
using System.Linq;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.Orders;
using Volo.Abp.Application.Dtos;
using HomeServicesApp.Coupons;
using HomeServicesApp.Loyalty;
using HomeServicesApp.Providers;
using HomeServicesApp.Services;
using System.Threading.Tasks;
using System.Collections.Generic; // Added for List
using HomeServicesApp.Notifications;
using HomeServicesApp.Users;
using Volo.Abp.Users;

namespace HomeServicesApp.Orders
{
    public class OrderAppService : CrudAppService<
        Order, // The Entity
        OrderDto, // DTO to return
        Guid, // Primary Key
        PagedAndSortedResultRequestDto, // Paging
        CreateUpdateOrderDto, // Create
        CreateUpdateOrderDto // Update
    >, IOrderAppService
    {
        private readonly IRepository<Coupon, Guid> _couponRepository;
        private readonly ILoyaltyPointAppService _loyaltyPointAppService;
        private readonly IRepository<Provider, Guid> _providerRepository;
        private readonly IRepository<Service, Guid> _serviceRepository;
        private readonly FirebasePushNotificationService _pushService;
        private readonly IUserProfileAppService _userProfileAppService;

        public OrderAppService(
            IRepository<Order, Guid> repository,
            IRepository<Coupon, Guid> couponRepository,
            ILoyaltyPointAppService loyaltyPointAppService,
            IRepository<Provider, Guid> providerRepository,
            IRepository<Service, Guid> serviceRepository,
            FirebasePushNotificationService pushService,
            IUserProfileAppService userProfileAppService
        ) : base(repository)
        {
            _couponRepository = couponRepository;
            _loyaltyPointAppService = loyaltyPointAppService;
            _providerRepository = providerRepository;
            _serviceRepository = serviceRepository;
            _pushService = pushService;
            _userProfileAppService = userProfileAppService;
        }

        public override async Task<OrderDto> CreateAsync(CreateUpdateOrderDto input)
        {
            var service = await _serviceRepository.GetAsync(input.ServiceId);
            decimal totalPrice = service.Price; // Default base price - should be calculated from service pricing

            // إذا أدخل المستخدم كود كوبون
            if (!string.IsNullOrWhiteSpace(input.CouponCode))
            {
                var coupon = await _couponRepository.FirstOrDefaultAsync(x =>
                    x.Code == input.CouponCode && x.IsActive && x.ExpiryDate > DateTime.Now && x.UsageCount < x.MaxUsage);

                if (coupon != null)
                {
                    // تطبيق الخصم
                    totalPrice -= coupon.DiscountValue;
                    if (totalPrice < 0) totalPrice = 0;

                    // زيادة عدد مرات الاستخدام
                    coupon.UsageCount++;
                    await _couponRepository.UpdateAsync(coupon);
                }
                else
                {
                    throw new Volo.Abp.UserFriendlyException("Coupon is invalid or expired.");
                }
            }

            // Generate all intended occurrences
            var occurrences = new List<DateTime>();
            if (input.IsRecurring && input.RecurrenceType != null && input.RecurrenceType != "None")
            {
                var interval = input.RecurrenceInterval ?? 1;
                var endDate = input.RecurrenceEndDate ?? input.ScheduledDate.AddMonths(3); // default 3 months
                var current = input.ScheduledDate;
                while (current <= endDate)
                {
                    occurrences.Add(current);
                    if (input.RecurrenceType == "Weekly")
                        current = current.AddDays(7 * interval);
                    else if (input.RecurrenceType == "Monthly")
                        current = current.AddMonths(interval);
                    else
                        break;
                }
            }
            else
            {
                occurrences.Add(input.ScheduledDate);
            }
            // Overlap validation for all occurrences
            foreach (var occ in occurrences)
            {
                var overlap = await Repository.AnyAsync(x =>
                    x.UserId == CurrentUser.Id &&
                    x.ServiceId == input.ServiceId &&
                    x.Status != OrderStatus.Cancelled &&
                    x.ScheduledDate == occ
                );
                if (overlap)
                {
                    throw new Volo.Abp.UserFriendlyException($"Booking conflict: You already have a booking for this service at {occ:G}.");
                }
            }
            // Create bookings
            Order firstOrder = null;
            foreach (var occ in occurrences)
            {
                var order = ObjectMapper.Map<CreateUpdateOrderDto, Order>(input);
                order.TotalPrice = totalPrice;
                order.ReminderEnabled = input.ReminderEnabled;
                order.IsRecurring = input.IsRecurring;
                order.RecurrenceType = input.RecurrenceType;
                order.RecurrenceInterval = input.RecurrenceInterval;
                order.RecurrenceEndDate = input.RecurrenceEndDate;
                order.ScheduledDate = occ;
                await Repository.InsertAsync(order);
                if (firstOrder == null) firstOrder = order;
            }
            // Send push notification to user
            var fcmToken = await _userProfileAppService.GetFcmTokenAsync();
            if (!string.IsNullOrEmpty(fcmToken))
            {
                await _pushService.SendNotificationAsync(fcmToken, "Booking Confirmed", $"Your booking for {input.ServiceId} on {input.ScheduledDate:G} is confirmed.");
            }
            return ObjectMapper.Map<Order, OrderDto>(firstOrder);
        }

        public async Task CompleteOrderAsync(Guid orderId)
        {
            var order = await Repository.GetAsync(orderId);
            order.Status = OrderStatus.Completed;
            await Repository.UpdateAsync(order);
            // إضافة نقاط الولاء للمستخدم
            await _loyaltyPointAppService.AddPointsAsync(order.UserId, 10, "OrderCompleted");
            // إضافة المبلغ إلى محفظة مقدم الخدمة
            if (order.ProviderId.HasValue)
            {
                var provider = await _providerRepository.GetAsync(order.ProviderId.Value);
                provider.WalletBalance += order.TotalPrice;
                await _providerRepository.UpdateAsync(provider);
            }
        }

        public async Task CancelAsync(Guid orderId)
        {
            var order = await Repository.GetAsync(orderId);
            order.Status = OrderStatus.Cancelled;
            await Repository.UpdateAsync(order);
        }

        public async Task AcceptAsync(Guid orderId)
        {
            var order = await Repository.GetAsync(orderId);
            order.Status = OrderStatus.Accepted;
            await Repository.UpdateAsync(order);
        }

        public async Task CompleteAsync(Guid orderId)
        {
            var order = await Repository.GetAsync(orderId);
            order.Status = OrderStatus.Completed;
            await Repository.UpdateAsync(order);
        }

        public async Task<List<OrderDto>> GetMyOrdersAsync()
        {
            var orders = await Repository.GetListAsync(x => x.UserId == CurrentUser.GetId());
            return ObjectMapper.Map<List<Order>, List<OrderDto>>(orders);
        }

        public async Task<List<OrderDto>> GetOrdersByProviderAsync(Guid providerId)
        {
            var orders = await Repository.GetListAsync(x => x.ProviderId == providerId);
            return ObjectMapper.Map<List<Order>, List<OrderDto>>(orders);
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, string status)
        {
            var order = await Repository.GetAsync(orderId);
            order.Status = Enum.Parse<OrderStatus>(status);
            await Repository.UpdateAsync(order);
            return ObjectMapper.Map<Order, OrderDto>(order);
        }

        public async Task<List<OrderDto>> SearchOrdersAsync(OrderSearchDto input)
        {
            var queryable = await Repository.GetQueryableAsync();
            
            if (input.UserId.HasValue)
                queryable = queryable.Where(x => x.UserId == input.UserId.Value);
            
            if (input.ProviderId.HasValue)
                queryable = queryable.Where(x => x.ProviderId == input.ProviderId.Value);
            
            if (!string.IsNullOrEmpty(input.Status))
                queryable = queryable.Where(x => x.Status.ToString() == input.Status);
            
            if (input.StartDate.HasValue)
                queryable = queryable.Where(x => x.ScheduledDate >= input.StartDate.Value);
            
            if (input.EndDate.HasValue)
                queryable = queryable.Where(x => x.ScheduledDate <= input.EndDate.Value);

            var orders = queryable.ToList();
            return ObjectMapper.Map<List<Order>, List<OrderDto>>(orders);
        }

        public async Task<OrderDto> RescheduleOrderAsync(Guid orderId, DateTime newDate)
        {
            var order = await Repository.GetAsync(orderId);
            order.ScheduledDate = newDate;
            await Repository.UpdateAsync(order);
            return ObjectMapper.Map<Order, OrderDto>(order);
        }

        public async Task<decimal> CalculateOrderTotalAsync(Guid serviceId, List<Guid> addOnIds, string couponCode)
        {
            var service = await _serviceRepository.GetAsync(serviceId);
            decimal total = service.Price;
            
            if (!string.IsNullOrWhiteSpace(couponCode))
            {
                var coupon = await _couponRepository.FirstOrDefaultAsync(x =>
                    x.Code == couponCode && x.IsActive && x.ExpiryDate > DateTime.Now && x.UsageCount < x.MaxUsage);
                
                if (coupon != null)
                {
                    total -= coupon.DiscountValue;
                    if (total < 0) total = 0;
                }
            }
            
            return total;
        }

        public async Task<List<OrderDto>> GetRecurringOrdersAsync()
        {
            var orders = await Repository.GetListAsync(x => x.IsRecurring && x.UserId == CurrentUser.GetId());
            return ObjectMapper.Map<List<Order>, List<OrderDto>>(orders);
        }

        public async Task<OrderDto> CancelRecurringOrderAsync(Guid orderId)
        {
            var order = await Repository.GetAsync(orderId);
            order.Status = OrderStatus.Cancelled;
            order.IsRecurring = false;
            await Repository.UpdateAsync(order);
            return ObjectMapper.Map<Order, OrderDto>(order);
        }
    }

    public interface IOrderAppService : ICrudAppService<
        OrderDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateOrderDto,
        CreateUpdateOrderDto>
    {
        Task CancelAsync(Guid orderId);
        Task AcceptAsync(Guid orderId);
        Task CompleteAsync(Guid orderId);
        Task<List<OrderDto>> GetMyOrdersAsync();
        Task<List<OrderDto>> GetOrdersByProviderAsync(Guid providerId);
        Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, string status);
        Task<List<OrderDto>> SearchOrdersAsync(OrderSearchDto input);
        Task<OrderDto> RescheduleOrderAsync(Guid orderId, DateTime newDate);
        Task<decimal> CalculateOrderTotalAsync(Guid serviceId, List<Guid> addOnIds, string couponCode);
        Task<List<OrderDto>> GetRecurringOrdersAsync();
        Task<OrderDto> CancelRecurringOrderAsync(Guid orderId);
    }
}            