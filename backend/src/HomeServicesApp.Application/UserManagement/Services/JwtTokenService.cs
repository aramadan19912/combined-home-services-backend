using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Volo.Abp.DependencyInjection;
using HomeServicesApp.UserManagement.Dtos;

namespace HomeServicesApp.UserManagement.Services
{
    public interface IJwtTokenService
    {
        Task<LoginResultDto> GenerateTokenAsync(User user, List<string> roles, List<string> groups, List<string> permissions);
        Task<LoginResultDto> RefreshTokenAsync(string refreshToken);
        Task<ClaimsPrincipal> ValidateTokenAsync(string token);
        string GenerateRefreshToken();
        Task RevokeRefreshTokenAsync(Guid userId);
    }

    public class JwtTokenService : IJwtTokenService, ITransientDependency
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;

        public JwtTokenService(IConfiguration configuration, IUserRepository userRepository)
        {
            _configuration = configuration;
            _userRepository = userRepository;
        }

        public async Task<LoginResultDto> GenerateTokenAsync(User user, List<string> roles, List<string> groups, List<string> permissions)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]);
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("firstName", user.FirstName ?? ""),
                new Claim("lastName", user.LastName ?? ""),
                new Claim("isActive", user.IsActive.ToString()),
                new Claim("isEmailConfirmed", user.IsEmailConfirmed.ToString())
            };

            // Add roles
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Add groups
            foreach (var group in groups)
            {
                claims.Add(new Claim("group", group));
            }

            // Add permissions
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }

            var tokenExpiry = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JWT:TokenValidityInMinutes"] ?? "60"));
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = tokenExpiry,
                Issuer = _configuration["JWT:ValidIssuer"],
                Audience = _configuration["JWT:ValidAudience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(token);

            // Generate refresh token
            var refreshToken = GenerateRefreshToken();
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["JWT:RefreshTokenValidityInDays"] ?? "7"));

            // Update user with refresh token
            user.UpdateRefreshToken(refreshToken, refreshTokenExpiry);
            await _userRepository.UpdateAsync(user);

            return new LoginResultDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                TokenExpiry = tokenExpiry,
                User = MapToUserDto(user),
                Roles = roles,
                Groups = groups,
                Permissions = permissions
            };
        }

        public async Task<LoginResultDto> RefreshTokenAsync(string refreshToken)
        {
            var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);
            
            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Invalid or expired refresh token");
            }

            // Get user roles, groups, and permissions
            var roles = await GetUserRolesAsync(user);
            var groups = await GetUserGroupsAsync(user);
            var permissions = await GetUserPermissionsAsync(user);

            return await GenerateTokenAsync(user, roles, groups, permissions);
        }

        public async Task<ClaimsPrincipal> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JWT:ValidIssuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JWT:ValidAudience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch
            {
                throw new UnauthorizedAccessException("Invalid token");
            }
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        public async Task RevokeRefreshTokenAsync(Guid userId)
        {
            var user = await _userRepository.GetAsync(userId);
            user.RevokeRefreshToken();
            await _userRepository.UpdateAsync(user);
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

        private async Task<List<string>> GetUserRolesAsync(User user)
        {
            // This would be implemented to get user roles from the repository
            return user.UserRoles
                .Where(ur => ur.IsEffective())
                .Select(ur => ur.Role.Name)
                .ToList();
        }

        private async Task<List<string>> GetUserGroupsAsync(User user)
        {
            // This would be implemented to get user groups from the repository
            return user.UserGroups
                .Where(ug => ug.IsEffective())
                .Select(ug => ug.Group.Name)
                .ToList();
        }

        private async Task<List<string>> GetUserPermissionsAsync(User user)
        {
            // This would be implemented to get user permissions from roles and groups
            var permissions = new List<string>();
            
            // Get permissions from roles
            foreach (var userRole in user.UserRoles.Where(ur => ur.IsEffective()))
            {
                permissions.AddRange(userRole.Role.RolePermissions
                    .Where(rp => rp.IsGranted)
                    .Select(rp => rp.Permission.Name));
            }

            // Get permissions from groups
            foreach (var userGroup in user.UserGroups.Where(ug => ug.IsEffective()))
            {
                permissions.AddRange(userGroup.Group.GroupPermissions
                    .Where(gp => gp.IsGranted)
                    .Select(gp => gp.Permission.Name));
            }

            return permissions.Distinct().ToList();
        }
    }

    // Repository interface that would be implemented in the infrastructure layer
    public interface IUserRepository
    {
        Task<User> GetAsync(Guid id);
        Task<User> GetByEmailOrUsernameAsync(string emailOrUsername);
        Task<User> GetByRefreshTokenAsync(string refreshToken);
        Task<User> InsertAsync(User user);
        Task<User> UpdateAsync(User user);
        Task DeleteAsync(Guid id);
    }
}