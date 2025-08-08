using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Reviews
{
    public class CreateUpdateReviewDto
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        public int Rating { get; set; } // 1-5

        [MaxLength(1024)]
        public string Comment { get; set; }
    }
} 