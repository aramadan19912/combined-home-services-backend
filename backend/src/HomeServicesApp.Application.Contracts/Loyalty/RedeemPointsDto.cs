using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Loyalty
{
    public class RedeemPointsDto
    {
        [Required]
        public int Points { get; set; }
        [MaxLength(256)]
        public string Reason { get; set; }
    }
} 