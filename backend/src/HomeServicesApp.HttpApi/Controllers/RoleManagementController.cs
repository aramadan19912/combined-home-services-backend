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
    [Authorize]
    public class RoleManagementController : AbpControllerBase
    {
        private readonly IRoleManagementAppService _roleManagementService;

        public RoleManagementController(IRoleManagementAppService roleManagementService)
        {
            _roleManagementService = roleManagementService;
        }

        /// <summary>
        /// Create a new role
        /// </summary>
        /// <param name="input">Role creation data</param>
        /// <returns>Created role information</returns>
        [HttpPost("roles")]
        [Authorize(Policy = "RoleManagement.Create")]
        [ProducesResponseType(typeof(RoleDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<RoleDto>> CreateRoleAsync([FromBody] CreateRoleDto input)
        {
            try
            {
                var result = await _roleManagementService.CreateRoleAsync(input);
                return CreatedAtAction(nameof(GetRoleAsync), new { id = result.Id }, result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing role
        /// </summary>
        /// <param name="id">Role ID</param>
        /// <param name="input">Role update data</param>
        /// <returns>Updated role information</returns>
        [HttpPut("roles/{id:guid}")]
        [Authorize(Policy = "RoleManagement.Update")]
        [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RoleDto>> UpdateRoleAsync(Guid id, [FromBody] UpdateRoleDto input)
        {
            try
            {
                var result = await _roleManagementService.UpdateRoleAsync(id, input);
                return Ok(result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a role
        /// </summary>
        /// <param name="id">Role ID</param>
        [HttpDelete("roles/{id:guid}")]
        [Authorize(Policy = "RoleManagement.Delete")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> DeleteRoleAsync(Guid id)
        {
            try
            {
                await _roleManagementService.DeleteRoleAsync(id);
                return NoContent();
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get role by ID
        /// </summary>
        /// <param name="id">Role ID</param>
        /// <returns>Role information</returns>
        [HttpGet("roles/{id:guid}")]
        [Authorize(Policy = "RoleManagement.View")]
        [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RoleDto>> GetRoleAsync(Guid id)
        {
            var result = await _roleManagementService.GetRoleAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Get roles with filtering and pagination
        /// </summary>
        /// <param name="input">Query parameters</param>
        /// <returns>Paginated list of roles</returns>
        [HttpGet("roles")]
        [Authorize(Policy = "RoleManagement.View")]
        [ProducesResponseType(typeof(PagedResultDto<RoleDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PagedResultDto<RoleDto>>> GetRolesAsync([FromQuery] GetRolesInput input)
        {
            var result = await _roleManagementService.GetRolesAsync(input);
            return Ok(result);
        }

        /// <summary>
        /// Activate a role
        /// </summary>
        /// <param name="id">Role ID</param>
        [HttpPost("roles/{id:guid}/activate")]
        [Authorize(Policy = "RoleManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> ActivateRoleAsync(Guid id)
        {
            await _roleManagementService.ActivateRoleAsync(id);
            return Ok(new { message = "Role activated successfully" });
        }

        /// <summary>
        /// Deactivate a role
        /// </summary>
        /// <param name="id">Role ID</param>
        [HttpPost("roles/{id:guid}/deactivate")]
        [Authorize(Policy = "RoleManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> DeactivateRoleAsync(Guid id)
        {
            try
            {
                await _roleManagementService.DeactivateRoleAsync(id);
                return Ok(new { message = "Role deactivated successfully" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Assign role to multiple users
        /// </summary>
        /// <param name="input">Role assignment data</param>
        [HttpPost("assign-role-to-users")]
        [Authorize(Policy = "RoleManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> AssignRoleToUsersAsync([FromBody] AssignRoleToUsersDto input)
        {
            try
            {
                await _roleManagementService.AssignRoleToUsersAsync(input);
                return Ok(new { message = "Role assigned to users successfully" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Remove role from multiple users
        /// </summary>
        /// <param name="input">Role removal data</param>
        [HttpPost("remove-role-from-users")]
        [Authorize(Policy = "RoleManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> RemoveRoleFromUsersAsync([FromBody] RemoveRoleFromUsersDto input)
        {
            try
            {
                await _roleManagementService.RemoveRoleFromUsersAsync(input);
                return Ok(new { message = "Role removed from users successfully" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Assign permissions to role
        /// </summary>
        /// <param name="roleId">Role ID</param>
        /// <param name="permissionIds">Permission IDs to assign</param>
        [HttpPost("roles/{roleId:guid}/permissions")]
        [Authorize(Policy = "RoleManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> AssignPermissionsToRoleAsync(Guid roleId, [FromBody] Guid[] permissionIds)
        {
            await _roleManagementService.AssignPermissionsToRoleAsync(roleId, permissionIds);
            return Ok(new { message = "Permissions assigned to role successfully" });
        }

        /// <summary>
        /// Remove permissions from role
        /// </summary>
        /// <param name="roleId">Role ID</param>
        /// <param name="permissionIds">Permission IDs to remove</param>
        [HttpDelete("roles/{roleId:guid}/permissions")]
        [Authorize(Policy = "RoleManagement.Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> RemovePermissionsFromRoleAsync(Guid roleId, [FromBody] Guid[] permissionIds)
        {
            await _roleManagementService.RemovePermissionsFromRoleAsync(roleId, permissionIds);
            return Ok(new { message = "Permissions removed from role successfully" });
        }

        /// <summary>
        /// Get users assigned to a role
        /// </summary>
        /// <param name="roleId">Role ID</param>
        /// <param name="input">Query parameters</param>
        /// <returns>Paginated list of users in the role</returns>
        [HttpGet("roles/{roleId:guid}/users")]
        [Authorize(Policy = "RoleManagement.View")]
        [ProducesResponseType(typeof(PagedResultDto<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PagedResultDto<UserDto>>> GetRoleUsersAsync(Guid roleId, [FromQuery] PagedAndSortedResultRequestDto input)
        {
            var result = await _roleManagementService.GetRoleUsersAsync(roleId, input);
            return Ok(result);
        }

        /// <summary>
        /// Check if role is in use (has users assigned)
        /// </summary>
        /// <param name="roleId">Role ID</param>
        /// <returns>True if role is in use</returns>
        [HttpGet("roles/{roleId:guid}/in-use")]
        [Authorize(Policy = "RoleManagement.View")]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> IsRoleInUseAsync(Guid roleId)
        {
            var result = await _roleManagementService.IsRoleInUseAsync(roleId);
            return Ok(result);
        }
    }
}