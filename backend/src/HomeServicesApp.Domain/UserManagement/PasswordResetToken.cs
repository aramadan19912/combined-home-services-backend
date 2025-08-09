using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class PasswordResetToken : CreationAuditedEntity<Guid>
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [StringLength(255)]
        public string Token { get; set; }

        [Required]
        [StringLength(100)]
        public string Email { get; set; }

        public DateTime ExpiryDate { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTime? UsedDate { get; set; }

        [StringLength(100)]
        public string IpAddress { get; set; }

        [StringLength(200)]
        public string UserAgent { get; set; }

        // Navigation properties
        public virtual User User { get; set; }

        protected PasswordResetToken()
        {
            // For ORM
        }

        public PasswordResetToken(
            Guid id,
            Guid userId,
            string token,
            string email,
            DateTime expiryDate,
            string ipAddress = null,
            string userAgent = null
        ) : base(id)
        {
            UserId = userId;
            Token = token;
            Email = email;
            ExpiryDate = expiryDate;
            IpAddress = ipAddress;
            UserAgent = userAgent;
        }

        public bool IsValid()
        {
            return !IsUsed && DateTime.UtcNow <= ExpiryDate;
        }

        public void MarkAsUsed()
        {
            IsUsed = true;
            UsedDate = DateTime.UtcNow;
        }

        public bool IsExpired()
        {
            return DateTime.UtcNow > ExpiryDate;
        }
    }
}