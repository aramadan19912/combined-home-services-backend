using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    /// <summary>
    /// Real-time provider location tracking for En Route orders
    /// </summary>
    public class ProviderLocation : FullAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// Provider ID
        /// </summary>
        public Guid ProviderId { get; set; }

        /// <summary>
        /// Order ID if provider is currently working on an order
        /// </summary>
        public Guid? OrderId { get; set; }

        /// <summary>
        /// Current latitude
        /// </summary>
        public double Latitude { get; set; }

        /// <summary>
        /// Current longitude
        /// </summary>
        public double Longitude { get; set; }

        /// <summary>
        /// Accuracy of the location in meters
        /// </summary>
        public double? Accuracy { get; set; }

        /// <summary>
        /// Heading/Direction in degrees
        /// </summary>
        public double? Heading { get; set; }

        /// <summary>
        /// Speed in meters per second
        /// </summary>
        public double? Speed { get; set; }

        /// <summary>
        /// Timestamp of location update
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Whether provider is currently active/online
        /// </summary>
        public bool IsOnline { get; set; }

        public ProviderLocation()
        {
            Timestamp = DateTime.UtcNow;
        }

        public ProviderLocation(Guid providerId, double latitude, double longitude, Guid? orderId = null)
        {
            ProviderId = providerId;
            Latitude = latitude;
            Longitude = longitude;
            OrderId = orderId;
            Timestamp = DateTime.UtcNow;
            IsOnline = true;
        }
    }
}
