using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Uow;
using HomeServicesApp;
using HomeServicesApp.Orders;
using Volo.Abp.Emailing;
using Volo.Abp.Identity;

namespace HomeServicesApp.Orders
{
    public class BookingReminderHostedService : BackgroundService
    {
        private readonly IRepository<Order, Guid> _orderRepository;
        private readonly IEmailSender _emailSender;
        private readonly ISmsSender _smsSender;
        private readonly IPushNotificationSender _pushSender;
        private readonly ILogger<BookingReminderHostedService> _logger;
        private readonly IUnitOfWorkManager _uowManager;
        private readonly IIdentityUserRepository _userRepository;

        public BookingReminderHostedService(
            IRepository<Order, Guid> orderRepository,
            IEmailSender emailSender,
            ISmsSender smsSender,
            IPushNotificationSender pushSender,
            ILogger<BookingReminderHostedService> logger,
            IUnitOfWorkManager uowManager,
            IIdentityUserRepository userRepository)
        {
            _orderRepository = orderRepository;
            _emailSender = emailSender;
            _smsSender = smsSender;
            _pushSender = pushSender;
            _logger = logger;
            _uowManager = uowManager;
            _userRepository = userRepository;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var uow = _uowManager.Begin())
                    {
                        var now = DateTime.UtcNow;
                        var soon = now.AddHours(1);
                        var bookings = await _orderRepository.GetListAsync(x =>
                            x.Status == OrderStatus.Pending &&
                            x.ScheduledDate > now &&
                            x.ScheduledDate <= soon &&
                            !x.ExtraProperties.ContainsKey("Reminded") &&
                            x.ReminderEnabled
                        );
                        foreach (var booking in bookings)
                        {
                            try
                            {
                                var user = await _userRepository.GetAsync(booking.UserId);
                                var email = user?.Email;
                                var phone = user?.PhoneNumber;
                                var pushId = user?.Id.ToString();
                                var message = $"Reminder: You have a booking scheduled for {booking.ScheduledDate:G} at {booking.Address}. Please be ready.";
                                if (!string.IsNullOrEmpty(email))
                                {
                                    await _emailSender.SendEmailAsync(email, "Booking Reminder", message);
                                }
                                if (!string.IsNullOrEmpty(phone))
                                {
                                    await _smsSender.SendSmsAsync(phone, message);
                                }
                                if (!string.IsNullOrEmpty(pushId))
                                {
                                    await _pushSender.SendPushAsync(pushId, "Booking Reminder", message);
                                }
                                _logger.LogInformation($"Sent reminder for booking {booking.Id} to user {user?.UserName ?? user?.Email ?? booking.UserId.ToString()}.");
                                booking.ExtraProperties["Reminded"] = true;
                                await _orderRepository.UpdateAsync(booking);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, $"Failed to send reminder for booking {booking.Id}");
                            }
                        }
                        await uow.CompleteAsync();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in BookingReminderHostedService");
                }
                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
            }
        }
    }
} 