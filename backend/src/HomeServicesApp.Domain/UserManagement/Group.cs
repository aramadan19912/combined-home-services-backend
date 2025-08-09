using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class Group : FullAuditedEntity<Guid>
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        public Guid? ParentGroupId { get; set; }

        // Navigation properties
        public virtual Group ParentGroup { get; set; }
        public virtual ICollection<Group> ChildGroups { get; set; } = new List<Group>();
        public virtual ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
        public virtual ICollection<GroupPermission> GroupPermissions { get; set; } = new List<GroupPermission>();

        protected Group()
        {
            // For ORM
        }

        public Group(Guid id, string name, string description = null, Guid? parentGroupId = null) : base(id)
        {
            Name = name;
            Description = description;
            ParentGroupId = parentGroupId;
        }

        public void Update(string name, string description, Guid? parentGroupId = null)
        {
            Name = name;
            Description = description;
            ParentGroupId = parentGroupId;
        }

        public void Activate()
        {
            IsActive = true;
        }

        public void Deactivate()
        {
            IsActive = false;
        }

        public bool IsChildOf(Guid groupId)
        {
            return ParentGroupId == groupId;
        }

        public bool IsDescendantOf(Group group)
        {
            var current = this;
            while (current.ParentGroup != null)
            {
                if (current.ParentGroupId == group.Id)
                    return true;
                current = current.ParentGroup;
            }
            return false;
        }
    }
}