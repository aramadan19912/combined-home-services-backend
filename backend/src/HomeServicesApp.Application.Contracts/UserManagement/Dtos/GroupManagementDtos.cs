using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.UserManagement.Dtos
{
    public class GroupDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public Guid? ParentGroupId { get; set; }
        public string ParentGroupName { get; set; }
        public DateTime CreationTime { get; set; }
        public List<GroupDto> ChildGroups { get; set; } = new List<GroupDto>();
        public List<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
        public int UserCount { get; set; }
        public int DirectUserCount { get; set; }
    }

    public class CreateGroupDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        public Guid? ParentGroupId { get; set; }

        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }

    public class UpdateGroupDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        public Guid? ParentGroupId { get; set; }

        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }

    public class GetGroupsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public bool? IsActive { get; set; }
        public Guid? ParentGroupId { get; set; }
        public bool IncludeChildGroups { get; set; } = false;
    }

    public class AssignGroupToUsersDto
    {
        [Required]
        public Guid GroupId { get; set; }

        [Required]
        public List<Guid> UserIds { get; set; } = new List<Guid>();

        public DateTime? ExpiryDate { get; set; }
    }

    public class RemoveGroupFromUsersDto
    {
        [Required]
        public Guid GroupId { get; set; }

        [Required]
        public List<Guid> UserIds { get; set; } = new List<Guid>();
    }

    public class GroupHierarchyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public int Level { get; set; }
        public List<GroupHierarchyDto> Children { get; set; } = new List<GroupHierarchyDto>();
    }
}