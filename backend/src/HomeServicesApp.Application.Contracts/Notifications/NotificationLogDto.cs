using System;

namespace HomeServicesApp.Notifications
{
    public class NotificationLogDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; }
        public string Data { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreationTime { get; set; }
    }
} 