using System;

namespace HomeServicesApp.Loyalty
{
    public class LoyaltyPointDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int Points { get; set; }
        public string Reason { get; set; }
        public DateTime CreationTime { get; set; }
    }
} 