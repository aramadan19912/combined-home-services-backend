using HomeServicesApp.Payments;
using HomeServicesApp.RegionalSettings;
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

        /// <summary>
        /// Latitude coordinate for service location
        /// </summary>
        public double? Latitude { get; set; }

        /// <summary>
        /// Longitude coordinate for service location
        /// </summary>
        public double? Longitude { get; set; }

        /// <summary>
        /// Special instructions or notes from customer
        /// </summary>
        public string SpecialInstructions { get; set; }

        /// <summary>
        /// Country where service will be provided
        /// </summary>
        public Country Country { get; set; }

        /// <summary>
        /// Currency for this order
        /// </summary>
        public Currency Currency { get; set; }

        /// <summary>
        /// Base service price before tax
        /// </summary>
        public decimal BasePrice { get; set; }

        /// <summary>
        /// Tax amount calculated based on country tax rate
        /// </summary>
        public decimal TaxAmount { get; set; }

        /// <summary>
        /// Tax rate applied (15% for SA, 14% for EG)
        /// </summary>
        public decimal TaxRate { get; set; }

        /// <summary>
        /// Platform service fee
        /// </summary>
        public decimal PlatformFee { get; set; }

        /// <summary>
        /// Total price including tax and fees
        /// </summary>
        public decimal TotalPrice { get; set; }

        /// <summary>
        /// Discount amount from coupons or promotions
        /// </summary>
        public decimal DiscountAmount { get; set; }

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

        /// <summary>
        /// Estimated arrival time for provider
        /// </summary>
        public DateTime? EstimatedArrivalTime { get; set; }

        /// <summary>
        /// Actual arrival time for provider
        /// </summary>
        public DateTime? ActualArrivalTime { get; set; }

        /// <summary>
        /// Completion time of the service
        /// </summary>
        public DateTime? CompletionTime { get; set; }

        public Order() { }

        public Order(Guid serviceId, Guid userId, DateTime scheduledDate, string address, decimal basePrice, Country country)
        {
            ServiceId = serviceId;
            UserId = userId;
            ScheduledDate = scheduledDate;
            Address = address;
            Country = country;

            // Get regional configuration
            var config = RegionalConfig.GetConfig(country);
            Currency = config.Currency;
            TaxRate = config.TaxRate;

            // Calculate prices
            BasePrice = basePrice;
            TaxAmount = basePrice * config.TaxRate;
            TotalPrice = basePrice + TaxAmount;

            Status = OrderStatus.Pending;
            PaymentStatus = PaymentStatus.Unpaid;
            PaidAmount = 0;
            RemainingAmount = TotalPrice;
            IsFullyPaid = false;
            ReminderEnabled = true;
        }

        /// <summary>
        /// Calculate total price with tax and apply discount if any
        /// </summary>
        public void CalculateTotalPrice(decimal? discountAmount = null)
        {
            TaxAmount = BasePrice * TaxRate;
            var priceBeforeDiscount = BasePrice + TaxAmount + PlatformFee;

            if (discountAmount.HasValue && discountAmount.Value > 0)
            {
                DiscountAmount = discountAmount.Value;
                TotalPrice = priceBeforeDiscount - DiscountAmount;
            }
            else
            {
                TotalPrice = priceBeforeDiscount;
            }

            RemainingAmount = TotalPrice - PaidAmount;
        }
    }

    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Accepted,
        EnRoute,
        InProgress,
        Completed,
        Cancelled,
        Disputed
    }
}