using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.UserManagement.Dtos;
using HomeServicesApp.UserManagement.Services;

namespace HomeServicesApp.UserManagement
{
    [Authorize]
    public class UserManagementAppService : ApplicationService, IUserManagementAppService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IUserActivityRepository _userActivityRepository;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IPasswordService _passwordService;
        private readonly ILogger<UserManagementAppService> _logger;

        public UserManagementAppService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IGroupRepository groupRepository,
            IUserActivityRepository userActivityRepository,
            IJwtTokenService jwtTokenService,
            IPasswordService passwordService,
            ILogger<UserManagementAppService> logger)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _groupRepository = groupRepository;
            _userActivityRepository = userActivityRepository;
            _jwtTokenService = jwtTokenService;
            _passwordService = passwordService;
            _logger = logger;
        }

        // Authentication
        [AllowAnonymous]
        public async Task<LoginResultDto> LoginAsync(LoginDto input)
        {
            try
            {
                var user = await _userRepository.GetByEmailOrUsernameAsync(input.EmailOrUsername);
                
                if (user == null)
                {
                    await LogUserActivity(null, ActivityTypes.FailedLogin, $"Login attempt with invalid credentials: {input.EmailOrUsername}");
                    throw new UserFriendlyException("Invalid email/username or password");
                }

                if (user.IsLockedOut())
                {
                    await LogUserActivity(user.Id, ActivityTypes.FailedLogin, "Login attempt on locked account");
                    throw new UserFriendlyException($"Account is locked until {user.LockoutEndDate}");
                }

                if (!user.IsActive)
                {
                    await LogUserActivity(user.Id, ActivityTypes.FailedLogin, "Login attempt on inactive account");
                    throw new UserFriendlyException("Account is inactive");
                }

                if (!_passwordService.VerifyPassword(input.Password, user.PasswordHash))
                {
                    user.IncrementFailedLoginAttempts();
                    await _userRepository.UpdateAsync(user);
                    await LogUserActivity(user.Id, ActivityTypes.FailedLogin, "Invalid password");
                    throw new UserFriendlyException("Invalid email/username or password");
                }

                // Successful login
                user.UpdateLoginInfo(DateTime.UtcNow);
                await _userRepository.UpdateAsync(user);

                // Get user roles, groups, and permissions
                var roles = await GetUserRolesAsync(user.Id);
                var groups = await GetUserGroupsAsync(user.Id);
                var permissions = await GetUserPermissionsAsync(user.Id);

                var result = await _jwtTokenService.GenerateTokenAsync(user, roles, groups, permissions);
                
                await LogUserActivity(user.Id, ActivityTypes.Login, "Successful login");
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {EmailOrUsername}", input.EmailOrUsername);
                throw;
            }
        }

        [AllowAnonymous]
        public async Task<LoginResultDto> RefreshTokenAsync(RefreshTokenDto input)
        {
            try
            {
                return await _jwtTokenService.RefreshTokenAsync(input.RefreshToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                throw new UserFriendlyException("Invalid refresh token");
            }
        }

        public async Task LogoutAsync()
        {
            try
            {
                var userId = CurrentUser.GetId();
                await _jwtTokenService.RevokeRefreshTokenAsync(userId);
                await LogUserActivity(userId, ActivityTypes.Logout, "User logged out");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                throw;
            }
        }

        // User Registration
        [AllowAnonymous]
        public async Task<UserDto> RegisterAsync(RegisterUserDto input)
        {
            try
            {
                // Validate password strength
                if (!_passwordService.IsPasswordStrong(input.Password))
                {
                    throw new UserFriendlyException("Password does not meet strength requirements");
                }

                // Check if user already exists
                var existingUser = await _userRepository.GetByEmailOrUsernameAsync(input.Email);
                if (existingUser != null)
                {
                    throw new UserFriendlyException("A user with this email already exists");
                }

                existingUser = await _userRepository.GetByEmailOrUsernameAsync(input.Username);
                if (existingUser != null)
                {
                    throw new UserFriendlyException("A user with this username already exists");
                }

                // Hash password
                var passwordHash = _passwordService.HashPassword(input.Password);

                // Create user
                var user = new User(
                    GuidGenerator.Create(),
                    input.Username,
                    input.Email,
                    passwordHash,
                    input.FirstName,
                    input.LastName,
                    input.PhoneNumber
                );

                await _userRepository.InsertAsync(user);

                // Assign default roles and groups if specified
                if (input.RoleIds?.Any() == true)
                {
                    await AssignRolesToUserInternalAsync(user.Id, input.RoleIds.ToArray());
                }

                if (input.GroupIds?.Any() == true)
                {
                    await AssignGroupsToUserInternalAsync(user.Id, input.GroupIds.ToArray());
                }

                await LogUserActivity(user.Id, ActivityTypes.Registration, "User registered successfully");

                return MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                throw;
            }
        }

        // User Management
        [Authorize(Policy = PermissionNames.UserManagement_Create)]
        public async Task<UserDto> CreateUserAsync(CreateUserDto input)
        {
            try
            {
                // Validate password strength
                if (!_passwordService.IsPasswordStrong(input.Password))
                {
                    throw new UserFriendlyException("Password does not meet strength requirements");
                }

                // Check if user already exists
                var existingUser = await _userRepository.GetByEmailOrUsernameAsync(input.Email);
                if (existingUser != null)
                {
                    throw new UserFriendlyException("A user with this email already exists");
                }

                existingUser = await _userRepository.GetByEmailOrUsernameAsync(input.Username);
                if (existingUser != null)
                {
                    throw new UserFriendlyException("A user with this username already exists");
                }

                // Hash password
                var passwordHash = _passwordService.HashPassword(input.Password);

                // Create user
                var user = new User(
                    GuidGenerator.Create(),
                    input.Username,
                    input.Email,
                    passwordHash,
                    input.FirstName,
                    input.LastName,
                    input.PhoneNumber
                );

                user.IsActive = input.IsActive;

                await _userRepository.InsertAsync(user);

                // Assign roles and groups
                if (input.RoleIds?.Any() == true)
                {
                    await AssignRolesToUserInternalAsync(user.Id, input.RoleIds.ToArray());
                }

                if (input.GroupIds?.Any() == true)
                {
                    await AssignGroupsToUserInternalAsync(user.Id, input.GroupIds.ToArray());
                }

                await LogUserActivity(user.Id, ActivityTypes.Registration, $"User created by {CurrentUser.UserName}");

                return MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                throw;
            }
        }

        [Authorize(Policy = PermissionNames.UserManagement_Update)]
        public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto input)
        {
            try
            {
                var user = await _userRepository.GetAsync(id);

                // Check if email/username conflicts with other users
                var existingUser = await _userRepository.GetByEmailOrUsernameAsync(input.Email);
                if (existingUser != null && existingUser.Id != id)
                {
                    throw new UserFriendlyException("A user with this email already exists");
                }

                existingUser = await _userRepository.GetByEmailOrUsernameAsync(input.Username);
                if (existingUser != null && existingUser.Id != id)
                {
                    throw new UserFriendlyException("A user with this username already exists");
                }

                // Update user properties
                user.Username = input.Username;
                user.Email = input.Email;
                user.FirstName = input.FirstName;
                user.LastName = input.LastName;
                user.PhoneNumber = input.PhoneNumber;
                user.IsActive = input.IsActive;

                await _userRepository.UpdateAsync(user);

                // Update roles and groups
                await UpdateUserRolesAndGroupsAsync(user.Id, input.RoleIds, input.GroupIds);

                await LogUserActivity(user.Id, ActivityTypes.ProfileUpdate, $"User updated by {CurrentUser.UserName}");

                return MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                throw;
            }
        }

        [Authorize(Policy = PermissionNames.UserManagement_Delete)]
        public async Task DeleteUserAsync(Guid id)
        {
            try
            {
                var user = await _userRepository.GetAsync(id);
                await _userRepository.DeleteAsync(id);
                await LogUserActivity(id, ActivityTypes.ProfileUpdate, $"User deleted by {CurrentUser.UserName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                throw;
            }
        }

        [Authorize(Policy = PermissionNames.UserManagement_View)]
        public async Task<UserDto> GetUserAsync(Guid id)
        {
            var user = await _userRepository.GetAsync(id);
            return MapToUserDto(user);
        }

        [Authorize(Policy = PermissionNames.UserManagement_View)]
        public async Task<PagedResultDto<UserDto>> GetUsersAsync(GetUsersInput input)
        {
            var users = await _userRepository.GetListAsync(input);
            var totalCount = await _userRepository.GetCountAsync(input);

            return new PagedResultDto<UserDto>(
                totalCount,
                users.Select(MapToUserDto).ToList()
            );
        }

        public async Task<UserDto> GetCurrentUserAsync()
        {
            var userId = CurrentUser.GetId();
            var user = await _userRepository.GetAsync(userId);
            return MapToUserDto(user);
        }

        // Password Management
        public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto input)
        {
            try
            {
                var user = await _userRepository.GetAsync(userId);

                // Verify current password
                if (!_passwordService.VerifyPassword(input.CurrentPassword, user.PasswordHash))
                {
                    throw new UserFriendlyException("Current password is incorrect");
                }

                // Validate new password strength
                if (!_passwordService.IsPasswordStrong(input.NewPassword))
                {
                    throw new UserFriendlyException("New password does not meet strength requirements");
                }

                // Hash and update password
                user.PasswordHash = _passwordService.HashPassword(input.NewPassword);
                await _userRepository.UpdateAsync(user);

                await LogUserActivity(userId, ActivityTypes.PasswordChange, "Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", userId);
                throw;
            }
        }

        [AllowAnonymous]
        public async Task ResetPasswordAsync(ResetPasswordDto input)
        {
            // Implementation for password reset with token validation
            // This would typically involve validating the reset token and updating the password
            throw new NotImplementedException("Password reset implementation pending");
        }

        [AllowAnonymous]
        public async Task<string> ForgotPasswordAsync(string email)
        {
            // Implementation for forgot password functionality
            // This would generate a reset token and send an email
            throw new NotImplementedException("Forgot password implementation pending");
        }

        // User Status Management
        [Authorize(Policy = PermissionNames.UserManagement_Update)]
        public async Task ActivateUserAsync(Guid id)
        {
            var user = await _userRepository.GetAsync(id);
            user.IsActive = true;
            await _userRepository.UpdateAsync(user);
            await LogUserActivity(id, ActivityTypes.AccountUnlock, $"Account activated by {CurrentUser.UserName}");
        }

        [Authorize(Policy = PermissionNames.UserManagement_Update)]
        public async Task DeactivateUserAsync(Guid id)
        {
            var user = await _userRepository.GetAsync(id);
            user.IsActive = false;
            await _userRepository.UpdateAsync(user);
            await LogUserActivity(id, ActivityTypes.AccountLockout, $"Account deactivated by {CurrentUser.UserName}");
        }

        [Authorize(Policy = PermissionNames.UserManagement_Update)]
        public async Task UnlockUserAsync(Guid id)
        {
            var user = await _userRepository.GetAsync(id);
            user.FailedLoginAttempts = 0;
            user.LockoutEndDate = null;
            await _userRepository.UpdateAsync(user);
            await LogUserActivity(id, ActivityTypes.AccountUnlock, $"Account unlocked by {CurrentUser.UserName}");
        }

        // Role and Group Management
        [Authorize(Policy = PermissionNames.UserManagement_Update)]
        public async Task AssignRolesToUserAsync(Guid userId, Guid[] roleIds)
        {
            await AssignRolesToUserInternalAsync(userId, roleIds);
            await LogUserActivity(userId, ActivityTypes.RoleAssignment, $"Roles assigned by {CurrentUser.UserName}");
        }

        [Authorize(Policy = PermissionNames.UserManagement_Update)]
        public async Task RemoveRolesFromUserAsync(Guid userId, Guid[] roleIds)
        {
            // Implementation for removing roles
            await LogUserActivity(userId, ActivityTypes.RoleAssignment, $"Roles removed by {CurrentUser.UserName}");
        }

        [Authorize(Policy = PermissionNames.UserManagement_Update)]
        public async Task AssignGroupsToUserAsync(Guid userId, Guid[] groupIds)
        {
            await AssignGroupsToUserInternalAsync(userId, groupIds);
            await LogUserActivity(userId, ActivityTypes.GroupAssignment, $"Groups assigned by {CurrentUser.UserName}");
        }

        [Authorize(Policy = PermissionNames.UserManagement_Update)]
        public async Task RemoveGroupsFromUserAsync(Guid userId, Guid[] groupIds)
        {
            // Implementation for removing groups
            await LogUserActivity(userId, ActivityTypes.GroupAssignment, $"Groups removed by {CurrentUser.UserName}");
        }

        // Email Confirmation
        public async Task SendEmailConfirmationAsync(Guid userId)
        {
            // Implementation for sending email confirmation
            throw new NotImplementedException("Email confirmation implementation pending");
        }

        [AllowAnonymous]
        public async Task ConfirmEmailAsync(Guid userId, string token)
        {
            // Implementation for confirming email
            throw new NotImplementedException("Email confirmation implementation pending");
        }

        // Private helper methods
        private async Task LogUserActivity(Guid? userId, string activityType, string description)
        {
            if (userId.HasValue)
            {
                var activity = new UserActivity(
                    GuidGenerator.Create(),
                    userId.Value,
                    activityType,
                    description,
                    GetClientIpAddress(),
                    GetUserAgent()
                );
                await _userActivityRepository.InsertAsync(activity);
            }
        }

        private string GetClientIpAddress()
        {
            // Implementation to get client IP address from HTTP context
            return "127.0.0.1"; // Placeholder
        }

        private string GetUserAgent()
        {
            // Implementation to get user agent from HTTP context
            return "Unknown"; // Placeholder
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                IsEmailConfirmed = user.IsEmailConfirmed,
                LastLoginDate = user.LastLoginDate,
                FailedLoginAttempts = user.FailedLoginAttempts,
                LockoutEndDate = user.LockoutEndDate,
                CreationTime = user.CreationTime
            };
        }

        private async Task<List<string>> GetUserRolesAsync(Guid userId)
        {
            // Implementation to get user roles
            return new List<string>();
        }

        private async Task<List<string>> GetUserGroupsAsync(Guid userId)
        {
            // Implementation to get user groups
            return new List<string>();
        }

        private async Task<List<string>> GetUserPermissionsAsync(Guid userId)
        {
            // Implementation to get user permissions
            return new List<string>();
        }

        private async Task AssignRolesToUserInternalAsync(Guid userId, Guid[] roleIds)
        {
            // Implementation for role assignment
        }

        private async Task AssignGroupsToUserInternalAsync(Guid userId, Guid[] groupIds)
        {
            // Implementation for group assignment
        }

        private async Task UpdateUserRolesAndGroupsAsync(Guid userId, List<Guid> roleIds, List<Guid> groupIds)
        {
            // Implementation for updating user roles and groups
        }
    }

    // Additional repository interfaces that would be implemented in the infrastructure layer
    public interface IRoleRepository : IRepository<Role, Guid>
    {
        // Additional role-specific methods
    }

    public interface IGroupRepository : IRepository<Group, Guid>
    {
        // Additional group-specific methods
    }

    public interface IUserActivityRepository : IRepository<UserActivity, Guid>
    {
        // Additional user activity-specific methods
    }
}