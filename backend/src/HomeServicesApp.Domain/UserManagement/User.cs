using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class User : FullAuditedEntity<Guid>
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; }

        [StringLength(100)]
        public string FirstName { get; set; }

        [StringLength(100)]
        public string LastName { get; set; }

        [StringLength(20)]
        public string PhoneNumber { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsEmailConfirmed { get; set; } = false;

        public DateTime? LastLoginDate { get; set; }

        public int FailedLoginAttempts { get; set; } = 0;

        public DateTime? LockoutEndDate { get; set; }

        [StringLength(255)]
        public string RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiryTime { get; set; }

        // Navigation properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
        public virtual ICollection<UserActivity> UserActivities { get; set; } = new List<UserActivity>();

        protected User()
        {
            // For ORM
        }

        public User(
            Guid id,
            string username,
            string email,
            string passwordHash,
            string firstName = null,
            string lastName = null,
            string phoneNumber = null
        ) : base(id)
        {
            Username = username;
            Email = email;
            PasswordHash = passwordHash;
            FirstName = firstName;
            LastName = lastName;
            PhoneNumber = phoneNumber;
        }

        public void UpdateLoginInfo(DateTime loginDate)
        {
            LastLoginDate = loginDate;
            FailedLoginAttempts = 0;
            LockoutEndDate = null;
        }

        public void IncrementFailedLoginAttempts()
        {
            FailedLoginAttempts++;
            
            // Lock account after 5 failed attempts for 30 minutes
            if (FailedLoginAttempts >= 5)
            {
                LockoutEndDate = DateTime.UtcNow.AddMinutes(30);
            }
        }

        public bool IsLockedOut()
        {
            return LockoutEndDate.HasValue && LockoutEndDate.Value > DateTime.UtcNow;
        }

        public void UpdateRefreshToken(string refreshToken, DateTime expiryTime)
        {
            RefreshToken = refreshToken;
            RefreshTokenExpiryTime = expiryTime;
        }

        public void RevokeRefreshToken()
        {
            RefreshToken = null;
            RefreshTokenExpiryTime = null;
        }
    }
}