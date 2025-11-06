using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.ChatMessages
{
    public class CreateChatMessageDto
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        public Guid SenderId { get; set; }

        [Required]
        public Guid ReceiverId { get; set; }

        [Required]
        public ChatMessageType MessageType { get; set; }

        [MaxLength(2000)]
        public string Message { get; set; }

        public string AttachmentUrl { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
