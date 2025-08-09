using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using HomeServicesApp.UserManagement;
using HomeServicesApp.UserManagement.Dtos;
using System.Linq;

namespace HomeServicesApp.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public class UserMetricsController : AbpControllerBase
    {
        private readonly IUserMetricsAppService _userMetricsService;

        public UserMetricsController(IUserMetricsAppService userMetricsService)
        {
            _userMetricsService = userMetricsService;
        }

        /// <summary>
        /// Get comprehensive system metrics including users, activities, roles, and groups
        /// </summary>
        /// <param name="input">Metrics query parameters</param>
        /// <returns>System metrics</returns>
        [HttpGet("system")]
        [Authorize(Policy = "Metrics.View")]
        [ProducesResponseType(typeof(SystemMetricsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<SystemMetricsDto>> GetSystemMetricsAsync([FromQuery] GetMetricsInput input)
        {
            var result = await _userMetricsService.GetSystemMetricsAsync(input);
            return Ok(result);
        }

        /// <summary>
        /// Get user-specific metrics (registrations, active users, etc.)
        /// </summary>
        /// <param name="input">Metrics query parameters</param>
        /// <returns>User metrics</returns>
        [HttpGet("users")]
        [Authorize(Policy = "Metrics.View")]
        [ProducesResponseType(typeof(UserMetricsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<UserMetricsDto>> GetUserMetricsAsync([FromQuery] GetMetricsInput input)
        {
            var result = await _userMetricsService.GetUserMetricsAsync(input);
            return Ok(result);
        }

        /// <summary>
        /// Get activity metrics (logins, failed attempts, etc.)
        /// </summary>
        /// <param name="input">Metrics query parameters</param>
        /// <returns>Activity metrics</returns>
        [HttpGet("activities")]
        [Authorize(Policy = "Metrics.View")]
        [ProducesResponseType(typeof(ActivityMetricsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<ActivityMetricsDto>> GetActivityMetricsAsync([FromQuery] GetMetricsInput input)
        {
            var result = await _userMetricsService.GetActivityMetricsAsync(input);
            return Ok(result);
        }

        /// <summary>
        /// Get user activities with filtering and pagination
        /// </summary>
        /// <param name="input">Activity query parameters</param>
        /// <returns>Paginated list of user activities</returns>
        [HttpGet("user-activities")]
        [Authorize(Policy = "Metrics.View")]
        [ProducesResponseType(typeof(PagedResultDto<UserActivityDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PagedResultDto<UserActivityDto>>> GetUserActivitiesAsync([FromQuery] GetUserActivitiesInput input)
        {
            var result = await _userMetricsService.GetUserActivitiesAsync(input);
            return Ok(result);
        }

        /// <summary>
        /// Log a user activity (for custom activity tracking)
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="activityType">Activity type</param>
        /// <param name="description">Activity description</param>
        /// <param name="isSuccessful">Whether the activity was successful</param>
        /// <param name="additionalData">Additional data (JSON string)</param>
        [HttpPost("log-activity")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> LogUserActivityAsync(
            [FromForm] Guid userId,
            [FromForm] string activityType,
            [FromForm] string description = null,
            [FromForm] bool isSuccessful = true,
            [FromForm] string additionalData = null)
        {
            await _userMetricsService.LogUserActivityAsync(
                userId, 
                activityType, 
                description, 
                GetClientIpAddress(), 
                GetUserAgent(), 
                isSuccessful, 
                additionalData);
            
            return Ok(new { message = "Activity logged successfully" });
        }

        /// <summary>
        /// Get all permissions with filtering and pagination
        /// </summary>
        /// <param name="input">Permission query parameters</param>
        /// <returns>Paginated list of permissions</returns>
        [HttpGet("permissions")]
        [Authorize(Policy = "AdminPanel.Access")]
        [ProducesResponseType(typeof(PagedResultDto<PermissionDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PagedResultDto<PermissionDto>>> GetPermissionsAsync([FromQuery] GetPermissionsInput input)
        {
            var result = await _userMetricsService.GetPermissionsAsync(input);
            return Ok(result);
        }

        /// <summary>
        /// Create a new permission
        /// </summary>
        /// <param name="input">Permission creation data</param>
        /// <returns>Created permission</returns>
        [HttpPost("permissions")]
        [Authorize(Policy = "SystemSettings.Manage")]
        [ProducesResponseType(typeof(PermissionDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PermissionDto>> CreatePermissionAsync([FromBody] CreatePermissionDto input)
        {
            var result = await _userMetricsService.CreatePermissionAsync(input);
            return CreatedAtAction(nameof(GetPermissionAsync), new { id = result.Id }, result);
        }

        /// <summary>
        /// Update an existing permission
        /// </summary>
        /// <param name="id">Permission ID</param>
        /// <param name="input">Permission update data</param>
        /// <returns>Updated permission</returns>
        [HttpPut("permissions/{id:guid}")]
        [Authorize(Policy = "SystemSettings.Manage")]
        [ProducesResponseType(typeof(PermissionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PermissionDto>> UpdatePermissionAsync(Guid id, [FromBody] UpdatePermissionDto input)
        {
            var result = await _userMetricsService.UpdatePermissionAsync(id, input);
            return Ok(result);
        }

        /// <summary>
        /// Delete a permission
        /// </summary>
        /// <param name="id">Permission ID</param>
        [HttpDelete("permissions/{id:guid}")]
        [Authorize(Policy = "SystemSettings.Manage")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeletePermissionAsync(Guid id)
        {
            await _userMetricsService.DeletePermissionAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Get permission by ID
        /// </summary>
        /// <param name="id">Permission ID</param>
        /// <returns>Permission details</returns>
        [HttpGet("permissions/{id:guid}")]
        [Authorize(Policy = "AdminPanel.Access")]
        [ProducesResponseType(typeof(PermissionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PermissionDto>> GetPermissionAsync(Guid id)
        {
            var result = await _userMetricsService.GetPermissionAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Check if a user has a specific permission
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="permissionName">Permission name</param>
        /// <returns>True if user has permission</returns>
        [HttpGet("users/{userId:guid}/has-permission")]
        [Authorize]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> HasPermissionAsync(Guid userId, [FromQuery] string permissionName)
        {
            var result = await _userMetricsService.HasPermissionAsync(userId, permissionName);
            return Ok(result);
        }

        /// <summary>
        /// Get all permissions for a user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Array of permission names</returns>
        [HttpGet("users/{userId:guid}/permissions")]
        [Authorize]
        [ProducesResponseType(typeof(string[]), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<string[]>> GetUserPermissionsAsync(Guid userId)
        {
            var result = await _userMetricsService.GetUserPermissionsAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Check if a user is in a specific role
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="roleName">Role name</param>
        /// <returns>True if user is in role</returns>
        [HttpGet("users/{userId:guid}/is-in-role")]
        [Authorize]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> IsInRoleAsync(Guid userId, [FromQuery] string roleName)
        {
            var result = await _userMetricsService.IsInRoleAsync(userId, roleName);
            return Ok(result);
        }

        /// <summary>
        /// Check if a user is in a specific group
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="groupName">Group name</param>
        /// <returns>True if user is in group</returns>
        [HttpGet("users/{userId:guid}/is-in-group")]
        [Authorize]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> IsInGroupAsync(Guid userId, [FromQuery] string groupName)
        {
            var result = await _userMetricsService.IsInGroupAsync(userId, groupName);
            return Ok(result);
        }

        /// <summary>
        /// Get count of active sessions
        /// </summary>
        /// <returns>Number of active sessions</returns>
        [HttpGet("active-sessions-count")]
        [Authorize(Policy = "Metrics.View")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<int>> GetActiveSessionsCountAsync()
        {
            var result = await _userMetricsService.GetActiveSessionsCountAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get today's login count
        /// </summary>
        /// <returns>Number of logins today</returns>
        [HttpGet("today-login-count")]
        [Authorize(Policy = "Metrics.View")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<int>> GetTodayLoginCountAsync()
        {
            var result = await _userMetricsService.GetTodayLoginCountAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get today's failed login count
        /// </summary>
        /// <returns>Number of failed logins today</returns>
        [HttpGet("today-failed-login-count")]
        [Authorize(Policy = "Metrics.View")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<int>> GetTodayFailedLoginCountAsync()
        {
            var result = await _userMetricsService.GetTodayFailedLoginCountAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get recent user activities
        /// </summary>
        /// <param name="count">Number of recent activities to retrieve (default: 50)</param>
        /// <returns>Array of recent activities</returns>
        [HttpGet("recent-activities")]
        [Authorize(Policy = "Metrics.View")]
        [ProducesResponseType(typeof(UserActivityDto[]), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<UserActivityDto[]>> GetRecentActivitiesAsync([FromQuery] int count = 50)
        {
            var result = await _userMetricsService.GetRecentActivitiesAsync(count);
            return Ok(result);
        }

        /// <summary>
        /// Get dashboard summary data for admin panel
        /// </summary>
        /// <returns>Dashboard summary with key metrics</returns>
        [HttpGet("dashboard-summary")]
        [Authorize(Policy = "AdminPanel.Access")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> GetDashboardSummaryAsync()
        {
            var systemMetrics = await _userMetricsService.GetSystemMetricsAsync(new GetMetricsInput());
            var todayLogins = await _userMetricsService.GetTodayLoginCountAsync();
            var todayFailedLogins = await _userMetricsService.GetTodayFailedLoginCountAsync();
            var activeSessions = await _userMetricsService.GetActiveSessionsCountAsync();
            var recentActivities = await _userMetricsService.GetRecentActivitiesAsync(10);

            var summary = new
            {
                TotalUsers = systemMetrics.UserMetrics.TotalUsers,
                ActiveUsers = systemMetrics.UserMetrics.ActiveUsers,
                NewUsersToday = systemMetrics.UserMetrics.NewUsersToday,
                TodayLogins = todayLogins,
                TodayFailedLogins = todayFailedLogins,
                ActiveSessions = activeSessions,
                TotalRoles = systemMetrics.TotalRoles,
                TotalGroups = systemMetrics.TotalGroups,
                RecentActivities = recentActivities,
                LastUpdated = DateTime.UtcNow
            };

            return Ok(summary);
        }

        private string GetClientIpAddress()
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1")
            {
                ipAddress = "127.0.0.1";
            }
            return ipAddress;
        }

        private string GetUserAgent()
        {
            return HttpContext.Request.Headers["User-Agent"].FirstOrDefault() ?? "Unknown";
        }
    }
}