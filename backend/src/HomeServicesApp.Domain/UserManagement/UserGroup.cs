using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class UserGroup : CreationAuditedEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid GroupId { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual User User { get; set; }
        public virtual Group Group { get; set; }

        protected UserGroup()
        {
            // For ORM
        }

        public UserGroup(Guid userId, Guid groupId, DateTime? expiryDate = null)
        {
            UserId = userId;
            GroupId = groupId;
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

        public override object[] GetKeys()
        {
            return new object[] { UserId, GroupId };
        }
    }
}