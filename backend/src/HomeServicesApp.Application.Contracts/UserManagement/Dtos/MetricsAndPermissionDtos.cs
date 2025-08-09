using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.UserManagement.Dtos
{
    // Permission DTOs
    public class PermissionDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreationTime { get; set; }
    }

    public class CreatePermissionDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        [StringLength(50)]
        public string Category { get; set; }
    }

    public class UpdatePermissionDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        [StringLength(50)]
        public string Category { get; set; }
    }

    public class GetPermissionsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public string Category { get; set; }
        public bool? IsActive { get; set; }
    }

    // User Activity DTOs
    public class UserActivityDto : EntityDto<Guid>
    {
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string ActivityType { get; set; }
        public string Description { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public DateTime ActivityDate { get; set; }
        public bool IsSuccessful { get; set; }
        public string AdditionalData { get; set; }
    }

    public class GetUserActivitiesInput : PagedAndSortedResultRequestDto
    {
        public Guid? UserId { get; set; }
        public string ActivityType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsSuccessful { get; set; }
        public string IpAddress { get; set; }
    }

    // Metrics DTOs
    public class UserMetricsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public int LockedUsers { get; set; }
        public int UnconfirmedEmailUsers { get; set; }
        public int NewUsersToday { get; set; }
        public int NewUsersThisWeek { get; set; }
        public int NewUsersThisMonth { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class ActivityMetricsDto
    {
        public int TotalLogins { get; set; }
        public int SuccessfulLogins { get; set; }
        public int FailedLogins { get; set; }
        public int UniqueActiveUsers { get; set; }
        public int LoginAttemptsToday { get; set; }
        public int SuccessfulLoginsToday { get; set; }
        public int FailedLoginsToday { get; set; }
        public List<HourlyActivityDto> HourlyActivity { get; set; } = new List<HourlyActivityDto>();
        public List<DailyActivityDto> DailyActivity { get; set; } = new List<DailyActivityDto>();
        public DateTime LastUpdated { get; set; }
    }

    public class HourlyActivityDto
    {
        public int Hour { get; set; }
        public int LoginCount { get; set; }
        public int FailedLoginCount { get; set; }
        public int UniqueUsers { get; set; }
    }

    public class DailyActivityDto
    {
        public DateTime Date { get; set; }
        public int LoginCount { get; set; }
        public int FailedLoginCount { get; set; }
        public int UniqueUsers { get; set; }
        public int NewUsers { get; set; }
    }

    public class SystemMetricsDto
    {
        public UserMetricsDto UserMetrics { get; set; }
        public ActivityMetricsDto ActivityMetrics { get; set; }
        public int TotalRoles { get; set; }
        public int ActiveRoles { get; set; }
        public int TotalGroups { get; set; }
        public int ActiveGroups { get; set; }
        public int TotalPermissions { get; set; }
        public int ActivePermissions { get; set; }
        public List<RoleUsageDto> TopRoles { get; set; } = new List<RoleUsageDto>();
        public List<GroupUsageDto> TopGroups { get; set; } = new List<GroupUsageDto>();
    }

    public class RoleUsageDto
    {
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
        public int UserCount { get; set; }
    }

    public class GroupUsageDto
    {
        public Guid GroupId { get; set; }
        public string GroupName { get; set; }
        public int UserCount { get; set; }
    }

    public class GetMetricsInput
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IncludeHourlyBreakdown { get; set; } = false;
        public bool IncludeDailyBreakdown { get; set; } = false;
        public int TopItemsCount { get; set; } = 10;
    }
}