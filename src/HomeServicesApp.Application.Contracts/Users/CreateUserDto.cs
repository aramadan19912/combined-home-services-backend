using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Users
{
    public class CreateUserDto
    {
        [Required]
        [MaxLength(64)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(64)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; }

        [Required]
        [Phone]
        [MaxLength(32)]
        public string PhoneNumber { get; set; }

        [Required]
        [MinLength(8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]", 
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }

        [Required]
        public string UserType { get; set; }

        [Required]
        public bool TermsAccepted { get; set; }

        [Required]
        public bool PrivacyPolicyAccepted { get; set; }

        public string Address { get; set; }
        public string PreferredLanguage { get; set; } = "en";
        public string TimeZone { get; set; } = "UTC";
    }
}
