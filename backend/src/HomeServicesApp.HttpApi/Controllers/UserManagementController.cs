using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using HomeServicesApp.UserManagement;
using HomeServicesApp.UserManagement.Dtos;

namespace HomeServicesApp.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Produces("application/json")]
    public class UserManagementController : AbpControllerBase
    {
        private readonly IUserManagementAppService _userManagementService;

        public UserManagementController(IUserManagementAppService userManagementService)
        {
            _userManagementService = userManagementService;
        }

        /// <summary>
        /// User login with email/username and password
        /// </summary>
        /// <param name="input">Login credentials</param>
        /// <returns>JWT token and user information</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(LoginResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResultDto>> LoginAsync([FromBody] LoginDto input)
        {
            try
            {
                var result = await _userManagementService.LoginAsync(input);
                return Ok(result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Refresh JWT token using refresh token
        /// </summary>
        /// <param name="input">Refresh token</param>
        /// <returns>New JWT token</returns>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(LoginResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResultDto>> RefreshTokenAsync([FromBody] RefreshTokenDto input)
        {
            try
            {
                var result = await _userManagementService.RefreshTokenAsync(input);
                return Ok(result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// User logout (revokes refresh token)
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> LogoutAsync()
        {
            await _userManagementService.LogoutAsync();
            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Register a new user account
        /// </summary>
        /// <param name="input">User registration data</param>
        /// <returns>Created user information</returns>
        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserDto>> RegisterAsync([FromBody] RegisterUserDto input)
        {
            try
            {
                var result = await _userManagementService.RegisterAsync(input);
                return CreatedAtAction(nameof(GetUserAsync), new { id = result.Id }, result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new user (Admin only)
        /// </summary>
        /// <param name="input">User creation data</param>
        /// <returns>Created user information</returns>
        [HttpPost("users")]
        [Authorize(Policy = "UserManagement.Create")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<UserDto>> CreateUserAsync([FromBody] CreateUserDto input)
        {
            try
            {
                var result = await _userManagementService.CreateUserAsync(input);
                return CreatedAtAction(nameof(GetUserAsync), new { id = result.Id }, result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing user
        /// </summary>
        /// <param name="id">User ID</param>
        /// <param name="input">User update data</param>
        /// <returns>Updated user information</returns>
        [HttpPut("users/{id:guid}")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> UpdateUserAsync(Guid id, [FromBody] UpdateUserDto input)
        {
            try
            {
                var result = await _userManagementService.UpdateUserAsync(id, input);
                return Ok(result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a user
        /// </summary>
        /// <param name="id">User ID</param>
        [HttpDelete("users/{id:guid}")]
        [Authorize(Policy = "UserManagement.Delete")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeleteUserAsync(Guid id)
        {
            await _userManagementService.DeleteUserAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User information</returns>
        [HttpGet("users/{id:guid}")]
        [Authorize(Policy = "UserManagement.View")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> GetUserAsync(Guid id)
        {
            var result = await _userManagementService.GetUserAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Get users with filtering and pagination
        /// </summary>
        /// <param name="input">Query parameters</param>
        /// <returns>Paginated list of users</returns>
        [HttpGet("users")]
        [Authorize(Policy = "UserManagement.View")]
        [ProducesResponseType(typeof(PagedResultDto<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PagedResultDto<UserDto>>> GetUsersAsync([FromQuery] GetUsersInput input)
        {
            var result = await _userManagementService.GetUsersAsync(input);
            return Ok(result);
        }

        /// <summary>
        /// Get current authenticated user information
        /// </summary>
        /// <returns>Current user information</returns>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<UserDto>> GetCurrentUserAsync()
        {
            var result = await _userManagementService.GetCurrentUserAsync();
            return Ok(result);
        }

        /// <summary>
        /// Change user password
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="input">Password change data</param>
        [HttpPost("users/{userId:guid}/change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> ChangePasswordAsync(Guid userId, [FromBody] ChangePasswordDto input)
        {
            try
            {
                await _userManagementService.ChangePasswordAsync(userId, input);
                return Ok(new { message = "Password changed successfully" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Reset password using reset token
        /// </summary>
        /// <param name="input">Password reset data</param>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> ResetPasswordAsync([FromBody] ResetPasswordDto input)
        {
            try
            {
                await _userManagementService.ResetPasswordAsync(input);
                return Ok(new { message = "Password reset successfully" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Request password reset (send reset email)
        /// </summary>
        /// <param name="email">User email</param>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> ForgotPasswordAsync([FromBody] string email)
        {
            try
            {
                var resetToken = await _userManagementService.ForgotPasswordAsync(email);
                return Ok(new { message = "Password reset email sent", resetToken }); // In production, don't return the token
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Activate user account
        /// </summary>
        /// <param name="id">User ID</param>
        [HttpPost("users/{id:guid}/activate")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> ActivateUserAsync(Guid id)
        {
            await _userManagementService.ActivateUserAsync(id);
            return Ok(new { message = "User activated successfully" });
        }

        /// <summary>
        /// Deactivate user account
        /// </summary>
        /// <param name="id">User ID</param>
        [HttpPost("users/{id:guid}/deactivate")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeactivateUserAsync(Guid id)
        {
            await _userManagementService.DeactivateUserAsync(id);
            return Ok(new { message = "User deactivated successfully" });
        }

        /// <summary>
        /// Unlock user account
        /// </summary>
        /// <param name="id">User ID</param>
        [HttpPost("users/{id:guid}/unlock")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> UnlockUserAsync(Guid id)
        {
            await _userManagementService.UnlockUserAsync(id);
            return Ok(new { message = "User unlocked successfully" });
        }

        /// <summary>
        /// Assign roles to user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="roleIds">Role IDs to assign</param>
        [HttpPost("users/{userId:guid}/roles")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> AssignRolesToUserAsync(Guid userId, [FromBody] Guid[] roleIds)
        {
            await _userManagementService.AssignRolesToUserAsync(userId, roleIds);
            return Ok(new { message = "Roles assigned successfully" });
        }

        /// <summary>
        /// Remove roles from user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="roleIds">Role IDs to remove</param>
        [HttpDelete("users/{userId:guid}/roles")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> RemoveRolesFromUserAsync(Guid userId, [FromBody] Guid[] roleIds)
        {
            await _userManagementService.RemoveRolesFromUserAsync(userId, roleIds);
            return Ok(new { message = "Roles removed successfully" });
        }

        /// <summary>
        /// Assign groups to user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="groupIds">Group IDs to assign</param>
        [HttpPost("users/{userId:guid}/groups")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> AssignGroupsToUserAsync(Guid userId, [FromBody] Guid[] groupIds)
        {
            await _userManagementService.AssignGroupsToUserAsync(userId, groupIds);
            return Ok(new { message = "Groups assigned successfully" });
        }

        /// <summary>
        /// Remove groups from user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="groupIds">Group IDs to remove</param>
        [HttpDelete("users/{userId:guid}/groups")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> RemoveGroupsFromUserAsync(Guid userId, [FromBody] Guid[] groupIds)
        {
            await _userManagementService.RemoveGroupsFromUserAsync(userId, groupIds);
            return Ok(new { message = "Groups removed successfully" });
        }

        /// <summary>
        /// Send email confirmation
        /// </summary>
        /// <param name="userId">User ID</param>
        [HttpPost("users/{userId:guid}/send-email-confirmation")]
        [Authorize(Policy = "UserManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> SendEmailConfirmationAsync(Guid userId)
        {
            await _userManagementService.SendEmailConfirmationAsync(userId);
            return Ok(new { message = "Email confirmation sent" });
        }

        /// <summary>
        /// Confirm email address
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="token">Confirmation token</param>
        [HttpPost("users/{userId:guid}/confirm-email")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> ConfirmEmailAsync(Guid userId, [FromQuery] string token)
        {
            try
            {
                await _userManagementService.ConfirmEmailAsync(userId, token);
                return Ok(new { message = "Email confirmed successfully" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}