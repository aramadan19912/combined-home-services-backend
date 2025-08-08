using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class UserRole : CreationAuditedEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid RoleId { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual User User { get; set; }
        public virtual Role Role { get; set; }

        protected UserRole()
        {
            // For ORM
        }

        public UserRole(Guid userId, Guid roleId, DateTime? expiryDate = null)
        {
            UserId = userId;
            RoleId = roleId;
            ExpiryDate = expiryDate;
        }

        public bool IsExpired()
        {
            return ExpiryDate.HasValue && ExpiryDate.Value <= DateTime.UtcNow;
        }

        public bool IsEffective()
        {
            return IsActive && !IsExpired();
        }

        public void Activate()
        {
            IsActive = true;
        }

        public void Deactivate()
        {
            IsActive = false;
        }

        public void ExtendExpiry(DateTime newExpiryDate)
        {
            ExpiryDate = newExpiryDate;
        }
    }
}