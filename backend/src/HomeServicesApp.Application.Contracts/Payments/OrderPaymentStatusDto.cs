using System;

namespace HomeServicesApp.Payments
{

    public enum PaymentStatus
    {
        Unpaid,
        Paid,
        Refunded
    }
    public class OrderPaymentStatusDto
    {
        public Guid OrderId { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public bool IsFullyPaid { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
    }
} 