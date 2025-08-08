using System;

namespace HomeServicesApp.Coupons
{
    public class CouponDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public decimal DiscountValue { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int UsageCount { get; set; }
        public int MaxUsage { get; set; }
        public bool IsActive { get; set; }
    }
} 