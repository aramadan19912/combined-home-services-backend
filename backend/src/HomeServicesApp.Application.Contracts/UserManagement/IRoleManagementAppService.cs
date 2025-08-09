using System;
using System.Threading.Tasks;
using HomeServicesApp.UserManagement.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.UserManagement
{
    public interface IRoleManagementAppService : IApplicationService
    {
        // Role CRUD
        Task<RoleDto> CreateRoleAsync(CreateRoleDto input);
        Task<RoleDto> UpdateRoleAsync(Guid id, UpdateRoleDto input);
        Task DeleteRoleAsync(Guid id);
        Task<RoleDto> GetRoleAsync(Guid id);
        Task<PagedResultDto<RoleDto>> GetRolesAsync(GetRolesInput input);
        
        // Role Status Management
        Task ActivateRoleAsync(Guid id);
        Task DeactivateRoleAsync(Guid id);
        
        // Role-User Assignment
        Task AssignRoleToUsersAsync(AssignRoleToUsersDto input);
        Task RemoveRoleFromUsersAsync(RemoveRoleFromUsersDto input);
        
        // Role Permissions
        Task AssignPermissionsToRoleAsync(Guid roleId, Guid[] permissionIds);
        Task RemovePermissionsFromRoleAsync(Guid roleId, Guid[] permissionIds);
        
        // Role Information
        Task<PagedResultDto<UserDto>> GetRoleUsersAsync(Guid roleId, PagedAndSortedResultRequestDto input);
        Task<bool> IsRoleInUseAsync(Guid roleId);
    }
}