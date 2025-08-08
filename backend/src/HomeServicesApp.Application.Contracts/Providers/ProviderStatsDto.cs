using System;

namespace HomeServicesApp.Providers
{
    public class ProviderStatsDto
    {
        public Guid ProviderId { get; set; }
        public int TotalOrders { get; set; }
        public double AverageRating { get; set; }
        public decimal WalletBalance { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal MonthlyEarnings { get; set; }
        public int TotalReviews { get; set; }
        public DateTime JoinDate { get; set; }
    }
}
