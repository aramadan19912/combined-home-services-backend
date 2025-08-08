using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Notifications;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace HomeServicesApp.Notifications
{
    [Authorize]
    public class NotificationLogAppService : ApplicationService, INotificationLogAppService
    {
        private readonly IRepository<NotificationLog, Guid> _notificationRepository;
        private readonly ICurrentUser _currentUser;

        public NotificationLogAppService(IRepository<NotificationLog, Guid> notificationRepository, ICurrentUser currentUser)
        {
            _notificationRepository = notificationRepository;
            _currentUser = currentUser;
        }

        public async Task<List<NotificationLogDto>> GetMyNotificationsAsync()
        {
            var userId = _currentUser.GetId();
            var notifications = await _notificationRepository.GetListAsync(x => x.UserId == userId);
            return notifications.OrderByDescending(x => x.CreationTime)
                .Select(x => new NotificationLogDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Type = x.Type,
                    Data = x.Data,
                    IsRead = x.IsRead,
                    CreationTime = x.CreationTime
                }).ToList();
        }

        public async Task MarkAsReadAsync(Guid notificationId)
        {
            var notification = await _notificationRepository.GetAsync(notificationId);
            if (notification.UserId == _currentUser.GetId())
            {
                notification.IsRead = true;
                await _notificationRepository.UpdateAsync(notification);
            }
        }
    }

    public interface INotificationLogAppService
    {
        Task<List<NotificationLogDto>> GetMyNotificationsAsync();
        Task MarkAsReadAsync(Guid notificationId);
    }
} 