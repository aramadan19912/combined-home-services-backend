using HomeServicesApp.Payments;
using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class Order : FullAuditedAggregateRoot<Guid>
    {
        public Guid ServiceId { get; set; }
        public Guid UserId { get; set; }
        public Guid? ProviderId { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string Address { get; set; }
        public decimal TotalPrice { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public bool IsFullyPaid { get; set; }
        public bool ReminderEnabled { get; set; } = true;
        public bool IsRecurring { get; set; } = false;
        public string RecurrenceType { get; set; } = "None"; // None, Weekly, Monthly
        public int? RecurrenceInterval { get; set; } // e.g. every N weeks
        public DateTime? RecurrenceEndDate { get; set; }
        public string CancellationReason { get; set; }

        public Order() { }

        public Order(Guid serviceId, Guid userId, DateTime scheduledDate, string address, decimal totalPrice)
        {
            ServiceId = serviceId;
            UserId = userId;
            ScheduledDate = scheduledDate;
            Address = address;
            TotalPrice = totalPrice;
            Status = OrderStatus.Pending;
            PaymentStatus = PaymentStatus.Unpaid;
            PaidAmount = 0;
            RemainingAmount = totalPrice;
            IsFullyPaid = false;
            ReminderEnabled = true;
        }
    }

    public enum OrderStatus
    {
        Accepted,
        Pending,
        InProgress,
        Completed,
        Cancelled
    }



}