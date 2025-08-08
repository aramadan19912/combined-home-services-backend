using System;

namespace HomeServicesApp.Payments
{
    public class PaymentTransactionDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public string TransactionStatus { get; set; }
        public string ProviderTransactionId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Notes { get; set; }
    }
} 