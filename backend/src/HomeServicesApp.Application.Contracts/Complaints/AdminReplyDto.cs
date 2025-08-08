using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Complaints
{
    public class AdminReplyDto
    {
        [Required]
        [MaxLength(1024)]
        public string Reply { get; set; }
    }
} 