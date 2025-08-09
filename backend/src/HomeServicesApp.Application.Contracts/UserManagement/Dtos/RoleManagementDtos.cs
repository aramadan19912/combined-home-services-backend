using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.UserManagement.Dtos
{
    public class RoleDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemRole { get; set; }
        public DateTime CreationTime { get; set; }
        public List<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
        public int UserCount { get; set; }
    }

    public class CreateRoleDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }

    public class UpdateRoleDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }

    public class GetRolesInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsSystemRole { get; set; }
    }

    public class AssignRoleToUsersDto
    {
        [Required]
        public Guid RoleId { get; set; }

        [Required]
        public List<Guid> UserIds { get; set; } = new List<Guid>();

        public DateTime? ExpiryDate { get; set; }
    }

    public class RemoveRoleFromUsersDto
    {
        [Required]
        public Guid RoleId { get; set; }

        [Required]
        public List<Guid> UserIds { get; set; } = new List<Guid>();
    }
}