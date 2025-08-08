using System;

namespace HomeServicesApp.Payments
{
    public class UserPaymentMethodDto
    {
        public Guid Id { get; set; }
        public string MethodType { get; set; }
        public string MaskedDetails { get; set; }
        public string? Provider { get; set; }
        public DateTime AddedAt { get; set; }
    }

    public class CreateUpdateUserPaymentMethodDto
    {
        public string MethodType { get; set; }
        public string MaskedDetails { get; set; }
        public string? Provider { get; set; }
    }
} 