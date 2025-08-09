using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp.UserManagement
{
    public class OtpToken : CreationAuditedEntity<Guid>
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [StringLength(10)]
        public string Code { get; set; }

        [Required]
        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(20)]
        public string PhoneNumber { get; set; }

        [Required]
        [StringLength(20)]
        public string Purpose { get; set; } // LOGIN, PASSWORD_RESET, EMAIL_VERIFICATION

        public DateTime ExpiryDate { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTime? UsedDate { get; set; }

        public int AttemptCount { get; set; } = 0;

        public int MaxAttempts { get; set; } = 3;

        [StringLength(100)]
        public string IpAddress { get; set; }

        [StringLength(200)]
        public string UserAgent { get; set; }

        // Navigation properties
        public virtual User User { get; set; }

        protected OtpToken()
        {
            // For ORM
        }

        public OtpToken(
            Guid id,
            Guid userId,
            string code,
            string email,
            string purpose,
            DateTime expiryDate,
            string phoneNumber = null,
            string ipAddress = null,
            string userAgent = null,
            int maxAttempts = 3
        ) : base(id)
        {
            UserId = userId;
            Code = code;
            Email = email;
            PhoneNumber = phoneNumber;
            Purpose = purpose;
            ExpiryDate = expiryDate;
            IpAddress = ipAddress;
            UserAgent = userAgent;
            MaxAttempts = maxAttempts;
        }

        public bool IsValid()
        {
            return !IsUsed && 
                   !IsExpired() && 
                   AttemptCount < MaxAttempts;
        }

        public bool IsExpired()
        {
            return DateTime.UtcNow > ExpiryDate;
        }

        public void IncrementAttempt()
        {
            AttemptCount++;
        }

        public void MarkAsUsed()
        {
            IsUsed = true;
            UsedDate = DateTime.UtcNow;
        }

        public bool VerifyCode(string inputCode)
        {
            IncrementAttempt();
            
            if (!IsValid())
            {
                return false;
            }

            if (Code.Equals(inputCode, StringComparison.OrdinalIgnoreCase))
            {
                MarkAsUsed();
                return true;
            }

            return false;
        }

        public int GetRemainingAttempts()
        {
            return Math.Max(0, MaxAttempts - AttemptCount);
        }
    }

    public static class OtpPurpose
    {
        public const string Login = "LOGIN";
        public const string PasswordReset = "PASSWORD_RESET";
        public const string EmailVerification = "EMAIL_VERIFICATION";
        public const string TwoFactorAuth = "TWO_FACTOR_AUTH";
    }
}