using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeServicesApp.UserManagement.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.UserManagement
{
    public interface IGroupManagementAppService : IApplicationService
    {
        // Group CRUD
        Task<GroupDto> CreateGroupAsync(CreateGroupDto input);
        Task<GroupDto> UpdateGroupAsync(Guid id, UpdateGroupDto input);
        Task DeleteGroupAsync(Guid id);
        Task<GroupDto> GetGroupAsync(Guid id);
        Task<PagedResultDto<GroupDto>> GetGroupsAsync(GetGroupsInput input);
        
        // Group Hierarchy
        Task<List<GroupHierarchyDto>> GetGroupHierarchyAsync();
        Task<List<GroupDto>> GetChildGroupsAsync(Guid parentGroupId);
        Task<GroupDto> GetParentGroupAsync(Guid groupId);
        
        // Group Status Management
        Task ActivateGroupAsync(Guid id);
        Task DeactivateGroupAsync(Guid id);
        
        // Group-User Assignment
        Task AssignGroupToUsersAsync(AssignGroupToUsersDto input);
        Task RemoveGroupFromUsersAsync(RemoveGroupFromUsersDto input);
        
        // Group Permissions
        Task AssignPermissionsToGroupAsync(Guid groupId, Guid[] permissionIds);
        Task RemovePermissionsFromGroupAsync(Guid groupId, Guid[] permissionIds);
        
        // Group Information
        Task<PagedResultDto<UserDto>> GetGroupUsersAsync(Guid groupId, PagedAndSortedResultRequestDto input);
        Task<bool> IsGroupInUseAsync(Guid groupId);
        Task<bool> CanDeleteGroupAsync(Guid groupId);
    }
}