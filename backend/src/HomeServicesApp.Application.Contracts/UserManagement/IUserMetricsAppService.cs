using System;
using System.Threading.Tasks;
using HomeServicesApp.UserManagement.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.UserManagement
{
    public interface IUserMetricsAppService : IApplicationService
    {
        // System Metrics
        Task<SystemMetricsDto> GetSystemMetricsAsync(GetMetricsInput input);
        Task<UserMetricsDto> GetUserMetricsAsync(GetMetricsInput input);
        Task<ActivityMetricsDto> GetActivityMetricsAsync(GetMetricsInput input);
        
        // User Activities
        Task<PagedResultDto<UserActivityDto>> GetUserActivitiesAsync(GetUserActivitiesInput input);
        Task LogUserActivityAsync(Guid userId, string activityType, string description = null, 
            string ipAddress = null, string userAgent = null, bool isSuccessful = true, string additionalData = null);
        
        // Permission Management
        Task<PagedResultDto<PermissionDto>> GetPermissionsAsync(GetPermissionsInput input);
        Task<PermissionDto> CreatePermissionAsync(CreatePermissionDto input);
        Task<PermissionDto> UpdatePermissionAsync(Guid id, UpdatePermissionDto input);
        Task DeletePermissionAsync(Guid id);
        Task<PermissionDto> GetPermissionAsync(Guid id);
        
        // User Permission Checking
        Task<bool> HasPermissionAsync(Guid userId, string permissionName);
        Task<string[]> GetUserPermissionsAsync(Guid userId);
        Task<bool> IsInRoleAsync(Guid userId, string roleName);
        Task<bool> IsInGroupAsync(Guid userId, string groupName);
        
        // Activity Statistics
        Task<int> GetActiveSessionsCountAsync();
        Task<int> GetTodayLoginCountAsync();
        Task<int> GetTodayFailedLoginCountAsync();
        Task<UserActivityDto[]> GetRecentActivitiesAsync(int count = 50);
    }
}