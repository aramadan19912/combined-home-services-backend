using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class RecurringPayment : FullAuditedAggregateRoot<Guid>
    {
        public Guid UserId { get; set; }
        public Guid ServiceId { get; set; }
        public decimal Amount { get; set; }
        public string Frequency { get; set; } // مثال: Monthly, Weekly
        public DateTime NextPaymentDate { get; set; }
        public bool IsActive { get; set; }
    }
} 