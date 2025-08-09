using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.UserManagement.Dtos
{
    // User Registration
    public class RegisterUserDto
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }

        [StringLength(100)]
        public string FirstName { get; set; }

        [StringLength(100)]
        public string LastName { get; set; }

        [StringLength(20)]
        public string PhoneNumber { get; set; }

        public List<Guid> RoleIds { get; set; } = new List<Guid>();
        public List<Guid> GroupIds { get; set; } = new List<Guid>();
    }

    // User Login
    public class LoginDto
    {
        [Required]
        public string EmailOrUsername { get; set; }

        [Required]
        public string Password { get; set; }

        public bool RememberMe { get; set; } = false;
    }

    public class OtpLoginDto
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string OtpCode { get; set; }
    }

    public class LoginResultDto
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime TokenExpiry { get; set; }
        public UserDto User { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public List<string> Groups { get; set; } = new List<string>();
        public List<string> Permissions { get; set; } = new List<string>();
    }

    // Refresh Token
    public class RefreshTokenDto
    {
        [Required]
        public string RefreshToken { get; set; }
    }

    // User Information
    public class UserDto : EntityDto<Guid>
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsActive { get; set; }
        public bool IsEmailConfirmed { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public int FailedLoginAttempts { get; set; }
        public DateTime? LockoutEndDate { get; set; }
        public DateTime CreationTime { get; set; }
        public List<RoleDto> Roles { get; set; } = new List<RoleDto>();
        public List<GroupDto> Groups { get; set; } = new List<GroupDto>();
    }

    public class CreateUserDto
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }

        [StringLength(100)]
        public string FirstName { get; set; }

        [StringLength(100)]
        public string LastName { get; set; }

        [StringLength(20)]
        public string PhoneNumber { get; set; }

        public bool IsActive { get; set; } = true;
        public List<Guid> RoleIds { get; set; } = new List<Guid>();
        public List<Guid> GroupIds { get; set; } = new List<Guid>();
    }

    public class UpdateUserDto
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(100)]
        public string FirstName { get; set; }

        [StringLength(100)]
        public string LastName { get; set; }

        [StringLength(20)]
        public string PhoneNumber { get; set; }

        public bool IsActive { get; set; }
        public List<Guid> RoleIds { get; set; } = new List<Guid>();
        public List<Guid> GroupIds { get; set; } = new List<Guid>();
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; }
    }

    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string ResetToken { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; }
    }

    public class GetUsersInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public bool? IsActive { get; set; }
        public List<Guid> RoleIds { get; set; }
        public List<Guid> GroupIds { get; set; }
    }
}