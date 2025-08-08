using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Orders
{
    public class OrderSearchDto : PagedAndSortedResultRequestDto
    {
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? ServiceId { get; set; }
        public Guid? ProviderId { get; set; }
        public Guid? UserId { get; set; }
        public string SearchTerm { get; set; }
        public bool? IsRecurring { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }

    public class OrderStatusHistoryDto
    {
        public Guid Id { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public DateTime ChangedAt { get; set; }
        public Guid ChangedBy { get; set; }
        public string ChangedByName { get; set; }
    }
}
