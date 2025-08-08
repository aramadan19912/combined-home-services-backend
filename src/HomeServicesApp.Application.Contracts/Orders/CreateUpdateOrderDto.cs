using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Orders
{
    public class CreateUpdateOrderDto
    {
        [Required]
        public Guid ServiceId { get; set; }

        [Required]
        public DateTime ScheduledDate { get; set; }

        public TimeSpan? ScheduledTime { get; set; }

        [Required]
        [MaxLength(512)]
        public string Address { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        [MaxLength(1000)]
        public string SpecialInstructions { get; set; }

        public string CouponCode { get; set; }

        public List<CreateOrderAddOnDto> AddOns { get; set; } = new List<CreateOrderAddOnDto>();

        public bool ReminderEnabled { get; set; } = true;

        public List<CreateOrderReminderDto> Reminders { get; set; } = new List<CreateOrderReminderDto>();

        public bool IsRecurring { get; set; } = false;

        [MaxLength(20)]
        public string RecurrenceType { get; set; } = "None";

        [Range(1, 365)]
        public int? RecurrenceInterval { get; set; }

        public DateTime? RecurrenceEndDate { get; set; }

        [MaxLength(50)]
        public string PreferredPaymentMethod { get; set; }

        public bool AutoPayForRecurring { get; set; } = false;
    }

    public class CreateOrderAddOnDto
    {
        [Required]
        public Guid AddOnId { get; set; }

        [Range(1, 100)]
        public int Quantity { get; set; } = 1;
    }

    public class CreateOrderReminderDto
    {
        [Required]
        [MaxLength(20)]
        public string Type { get; set; }

        [Range(1, 168)]
        public int HoursBefore { get; set; }
    }
} 