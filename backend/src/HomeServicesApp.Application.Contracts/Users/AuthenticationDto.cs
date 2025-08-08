using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Users
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        public bool RememberMe { get; set; }
    }

    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class ResetPasswordDto
    {
        [Required]
        public string Token { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]", 
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; }
    }

    public class VerifyEmailDto
    {
        [Required]
        public string Token { get; set; }

        [Required]
        public Guid UserId { get; set; }
    }

    public class VerifyPhoneDto
    {
        [Required]
        [MaxLength(6)]
        public string Code { get; set; }

        [Required]
        [Phone]
        public string PhoneNumber { get; set; }
    }

    public class TwoFactorSetupDto
    {
        [Required]
        [MaxLength(6)]
        public string Code { get; set; }

        [Required]
        public string SecretKey { get; set; }
    }

    public class LoginResultDto
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public UserProfileDto User { get; set; }
        public bool RequiresTwoFactor { get; set; }
        public bool RequiresEmailVerification { get; set; }
    }
}
