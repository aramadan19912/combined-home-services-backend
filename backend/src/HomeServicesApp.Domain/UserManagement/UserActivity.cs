using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class UserActivity : CreationAuditedEntity<Guid>
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [StringLength(50)]
        public string ActivityType { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        [StringLength(100)]
        public string IpAddress { get; set; }

        [StringLength(200)]
        public string UserAgent { get; set; }

        public DateTime ActivityDate { get; set; }

        public bool IsSuccessful { get; set; }

        [StringLength(500)]
        public string AdditionalData { get; set; }

        // Navigation properties
        public virtual User User { get; set; }

        protected UserActivity()
        {
            // For ORM
        }

        public UserActivity(
            Guid id,
            Guid userId,
            string activityType,
            string description = null,
            string ipAddress = null,
            string userAgent = null,
            bool isSuccessful = true,
            string additionalData = null
        ) : base(id)
        {
            UserId = userId;
            ActivityType = activityType;
            Description = description;
            IpAddress = ipAddress;
            UserAgent = userAgent;
            ActivityDate = DateTime.UtcNow;
            IsSuccessful = isSuccessful;
            AdditionalData = additionalData;
        }
    }

    public static class ActivityTypes
    {
        public const string Login = "LOGIN";
        public const string Logout = "LOGOUT";
        public const string FailedLogin = "FAILED_LOGIN";
        public const string Registration = "REGISTRATION";
        public const string PasswordChange = "PASSWORD_CHANGE";
        public const string ProfileUpdate = "PROFILE_UPDATE";
        public const string RoleAssignment = "ROLE_ASSIGNMENT";
        public const string GroupAssignment = "GROUP_ASSIGNMENT";
        public const string AccountLockout = "ACCOUNT_LOCKOUT";
        public const string AccountUnlock = "ACCOUNT_UNLOCK";
        public const string EmailConfirmation = "EMAIL_CONFIRMATION";
        public const string PasswordReset = "PASSWORD_RESET";
    }
}