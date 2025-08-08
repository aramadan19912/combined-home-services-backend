using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Coupons
{
    public class CreateUpdateCouponDto
    {
        [Required]
        [MaxLength(32)]
        public string Code { get; set; }

        [Range(0, double.MaxValue)]
        public decimal DiscountValue { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        [Range(1, int.MaxValue)]
        public int MaxUsage { get; set; }

        public bool IsActive { get; set; } = true;
    }
} 