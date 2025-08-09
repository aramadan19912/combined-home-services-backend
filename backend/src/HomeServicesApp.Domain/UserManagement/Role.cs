using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class Role : FullAuditedEntity<Guid>
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsSystemRole { get; set; } = false;

        // Navigation properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

        protected Role()
        {
            // For ORM
        }

        public Role(Guid id, string name, string description = null, bool isSystemRole = false) : base(id)
        {
            Name = name;
            Description = description;
            IsSystemRole = isSystemRole;
        }

        public void Update(string name, string description)
        {
            Name = name;
            Description = description;
        }

        public void Activate()
        {
            IsActive = true;
        }

        public void Deactivate()
        {
            if (IsSystemRole)
            {
                throw new InvalidOperationException("System roles cannot be deactivated");
            }
            IsActive = false;
        }
    }
}