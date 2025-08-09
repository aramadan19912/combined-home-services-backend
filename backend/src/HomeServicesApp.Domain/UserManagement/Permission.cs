using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class Permission : FullAuditedEntity<Guid>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        [StringLength(50)]
        public string Category { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public virtual ICollection<GroupPermission> GroupPermissions { get; set; } = new List<GroupPermission>();

        protected Permission()
        {
            // For ORM
        }

        public Permission(Guid id, string name, string description = null, string category = null) : base(id)
        {
            Name = name;
            Description = description;
            Category = category;
        }
    }

    public class RolePermission : CreationAuditedEntity
    {
        [Required]
        public Guid RoleId { get; set; }

        [Required]
        public Guid PermissionId { get; set; }

        public bool IsGranted { get; set; } = true;

        // Navigation properties
        public virtual Role Role { get; set; }
        public virtual Permission Permission { get; set; }

        protected RolePermission()
        {
            // For ORM
        }

        public RolePermission(Guid roleId, Guid permissionId, bool isGranted = true)
        {
            RoleId = roleId;
            PermissionId = permissionId;
            IsGranted = isGranted;
        }

        public override object[] GetKeys()
        {
            return new object[] { RoleId, PermissionId };
        }
    }

    public class GroupPermission : CreationAuditedEntity
    {
        [Required]
        public Guid GroupId { get; set; }

        [Required]
        public Guid PermissionId { get; set; }

        public bool IsGranted { get; set; } = true;

        // Navigation properties
        public virtual Group Group { get; set; }
        public virtual Permission Permission { get; set; }

        protected GroupPermission()
        {
            // For ORM
        }

        public GroupPermission(Guid groupId, Guid permissionId, bool isGranted = true)
        {
            GroupId = groupId;
            PermissionId = permissionId;
            IsGranted = isGranted;
        }

        public override object[] GetKeys()
        {
            return new object[] { GroupId, PermissionId };
        }
    }

    public static class PermissionNames
    {
        public const string UserManagement_Create = "UserManagement.Create";
        public const string UserManagement_Update = "UserManagement.Update";
        public const string UserManagement_Delete = "UserManagement.Delete";
        public const string UserManagement_View = "UserManagement.View";
        
        public const string RoleManagement_Create = "RoleManagement.Create";
        public const string RoleManagement_Update = "RoleManagement.Update";
        public const string RoleManagement_Delete = "RoleManagement.Delete";
        public const string RoleManagement_View = "RoleManagement.View";
        
        public const string GroupManagement_Create = "GroupManagement.Create";
        public const string GroupManagement_Update = "GroupManagement.Update";
        public const string GroupManagement_Delete = "GroupManagement.Delete";
        public const string GroupManagement_View = "GroupManagement.View";
        
        public const string AdminPanel_Access = "AdminPanel.Access";
        public const string Metrics_View = "Metrics.View";
        public const string SystemSettings_Manage = "SystemSettings.Manage";
    }
}