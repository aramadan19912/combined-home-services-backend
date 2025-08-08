using System;
using System.Threading.Tasks;
using HomeServicesApp.UserManagement.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.UserManagement
{
    public interface IUserManagementAppService : IApplicationService
    {
        // Authentication
        Task<LoginResultDto> LoginAsync(LoginDto input);
        Task<LoginResultDto> RefreshTokenAsync(RefreshTokenDto input);
        Task LogoutAsync();
        
        // User Registration
        Task<UserDto> RegisterAsync(RegisterUserDto input);
        
        // User Management
        Task<UserDto> CreateUserAsync(CreateUserDto input);
        Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto input);
        Task DeleteUserAsync(Guid id);
        Task<UserDto> GetUserAsync(Guid id);
        Task<PagedResultDto<UserDto>> GetUsersAsync(GetUsersInput input);
        Task<UserDto> GetCurrentUserAsync();
        
        // Password Management
        Task ChangePasswordAsync(Guid userId, ChangePasswordDto input);
        Task ResetPasswordAsync(ResetPasswordDto input);
        Task<string> ForgotPasswordAsync(string email);
        
        // User Status Management
        Task ActivateUserAsync(Guid id);
        Task DeactivateUserAsync(Guid id);
        Task UnlockUserAsync(Guid id);
        
        // User Role Management
        Task AssignRolesToUserAsync(Guid userId, Guid[] roleIds);
        Task RemoveRolesFromUserAsync(Guid userId, Guid[] roleIds);
        
        // User Group Management
        Task AssignGroupsToUserAsync(Guid userId, Guid[] groupIds);
        Task RemoveGroupsFromUserAsync(Guid userId, Guid[] groupIds);
        
        // Email Confirmation
        Task SendEmailConfirmationAsync(Guid userId);
        Task ConfirmEmailAsync(Guid userId, string token);
    }
}