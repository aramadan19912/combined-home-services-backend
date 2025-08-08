using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Users
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string ProfileImage { get; set; }
        public string UserType { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? EmailVerifiedAt { get; set; }
        public DateTime? PhoneVerifiedAt { get; set; }
        public bool TermsAccepted { get; set; }
        public bool PrivacyPolicyAccepted { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public int FailedLoginAttempts { get; set; }
        public DateTime? AccountLockedUntil { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public string PreferredLanguage { get; set; }
        public string TimeZone { get; set; }
    }
}   