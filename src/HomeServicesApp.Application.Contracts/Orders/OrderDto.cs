using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Orders
{
    public class OrderDto : FullAuditedEntityDto<Guid>
    {
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string UserPhone { get; set; }
        public Guid? ProviderId { get; set; }
        public string ProviderName { get; set; }
        public string Status { get; set; }
        public DateTime ScheduledDate { get; set; }
        public TimeSpan? ScheduledTime { get; set; }
        public string Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalPrice { get; set; }
        public string PaymentStatus { get; set; }
        public string PaymentMethod { get; set; }
        public string SpecialInstructions { get; set; }
        public bool ReminderEnabled { get; set; }
        public List<OrderReminderDto> Reminders { get; set; } = new List<OrderReminderDto>();
        public bool IsRecurring { get; set; }
        public string RecurrenceType { get; set; }
        public int? RecurrenceInterval { get; set; }
        public DateTime? RecurrenceEndDate { get; set; }
        public DateTime? NextRecurrenceDate { get; set; }
        public string CouponCode { get; set; }
        public List<OrderAddOnDto> AddOns { get; set; } = new List<OrderAddOnDto>();
        public DateTime? CompletedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string CancellationReason { get; set; }
        public decimal? RefundAmount { get; set; }
        public bool CanModify { get; set; }
        public bool CanCancel { get; set; }
        public int EstimatedDuration { get; set; }
        public string EstimatedDurationUnit { get; set; }
    }

    public class OrderReminderDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
        public int HoursBefore { get; set; }
        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }
    }

    public class OrderAddOnDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
