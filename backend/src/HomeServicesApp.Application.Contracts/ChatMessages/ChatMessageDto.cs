using System;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.ChatMessages
{
    public class ChatMessageDto : EntityDto<Guid>
    {
        public Guid OrderId { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }

        public ChatMessageType MessageType { get; set; }
        public string Message { get; set; }
        public string AttachmentUrl { get; set; }
        public string ThumbnailUrl { get; set; }

        // Location data
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // Status tracking
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime? DeliveredAt { get; set; }

        public DateTime CreationTime { get; set; }

        // Display properties
        public string SenderName { get; set; }
        public string ReceiverName { get; set; }
    }

    // Use domain enum - matches HomeServicesApp.ChatMessageType
    public enum ChatMessageType
    {
        Text = 1,
        Image = 2,
        Voice = 3,
        Location = 4
    }
}
