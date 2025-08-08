using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Orders
{
    public class UpdateOrderStatusDto
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }
    }

    public class CancelOrderDto
    {
        [Required]
        [MaxLength(500)]
        public string Reason { get; set; }

        public bool RequestRefund { get; set; } = false;
    }

    public class ModifyOrderDto
    {
        public DateTime? NewScheduledDate { get; set; }

        public TimeSpan? NewScheduledTime { get; set; }

        [MaxLength(512)]
        public string NewAddress { get; set; }

        public double? NewLatitude { get; set; }

        public double? NewLongitude { get; set; }

        [MaxLength(1000)]
        public string NewSpecialInstructions { get; set; }

        [MaxLength(500)]
        public string ModificationReason { get; set; }
    }
}
