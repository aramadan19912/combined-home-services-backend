using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Complaints
{
    public class CreateComplaintDto
    {
        [Required]
        [MaxLength(1024)]
        public string Message { get; set; }
        public string AttachmentPath { get; set; }
    }
} 