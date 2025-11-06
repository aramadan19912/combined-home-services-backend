using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    /// <summary>
    /// Chat message entity for customer-provider communication
    /// </summary>
    public class ChatMessage : FullAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// Order ID this conversation belongs to
        /// </summary>
        public Guid OrderId { get; set; }

        /// <summary>
        /// Sender user ID
        /// </summary>
        public Guid SenderId { get; set; }

        /// <summary>
        /// Receiver user ID
        /// </summary>
        public Guid ReceiverId { get; set; }

        /// <summary>
        /// Message content
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Message type (Text, Image, Voice, Location)
        /// </summary>
        public ChatMessageType MessageType { get; set; }

        /// <summary>
        /// Attachment URL if any (image, voice recording)
        /// </summary>
        public string AttachmentUrl { get; set; }

        /// <summary>
        /// Thumbnail URL for images
        /// </summary>
        public string ThumbnailUrl { get; set; }

        /// <summary>
        /// Whether message has been read
        /// </summary>
        public bool IsRead { get; set; }

        /// <summary>
        /// When message was read
        /// </summary>
        public DateTime? ReadAt { get; set; }

        /// <summary>
        /// When message was delivered
        /// </summary>
        public DateTime? DeliveredAt { get; set; }

        /// <summary>
        /// Latitude if sharing location
        /// </summary>
        public double? Latitude { get; set; }

        /// <summary>
        /// Longitude if sharing location
        /// </summary>
        public double? Longitude { get; set; }

        public ChatMessage()
        {
            MessageType = ChatMessageType.Text;
            IsRead = false;
        }

        public ChatMessage(Guid orderId, Guid senderId, Guid receiverId, string message, ChatMessageType messageType = ChatMessageType.Text)
        {
            OrderId = orderId;
            SenderId = senderId;
            ReceiverId = receiverId;
            Message = message;
            MessageType = messageType;
            IsRead = false;
        }

        public void MarkAsRead()
        {
            IsRead = true;
            ReadAt = DateTime.UtcNow;
        }

        public void MarkAsDelivered()
        {
            DeliveredAt = DateTime.UtcNow;
        }
    }

    public enum ChatMessageType
    {
        Text = 1,
        Image = 2,
        Voice = 3,
        Location = 4
    }
}
