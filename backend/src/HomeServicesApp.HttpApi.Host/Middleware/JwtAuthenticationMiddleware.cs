using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using HomeServicesApp.UserManagement.Services;

namespace HomeServicesApp.Middleware
{
    public class JwtAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly ILogger<JwtAuthenticationMiddleware> _logger;

        public JwtAuthenticationMiddleware(
            RequestDelegate next,
            IJwtTokenService jwtTokenService,
            ILogger<JwtAuthenticationMiddleware> logger)
        {
            _next = next;
            _jwtTokenService = jwtTokenService;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                var token = ExtractTokenFromHeader(context);
                
                if (!string.IsNullOrEmpty(token))
                {
                    var principal = await _jwtTokenService.ValidateTokenAsync(token);
                    
                    if (principal != null)
                    {
                        context.User = principal;
                        
                        // Log successful authentication
                        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        var username = principal.FindFirst(ClaimTypes.Name)?.Value;
                        
                        _logger.LogDebug("Successfully authenticated user {Username} (ID: {UserId})", username, userId);
                    }
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Invalid JWT token: {Message}", ex.Message);
                // Don't throw - let the authorization attributes handle unauthorized access
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing JWT token");
                // Don't throw - let the request continue and authorization attributes will handle it
            }

            await _next(context);
        }

        private string ExtractTokenFromHeader(HttpContext context)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            
            if (authHeader != null && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }

            return null;
        }
    }

    public static class JwtAuthenticationMiddlewareExtensions
    {
        public static IApplicationBuilder UseJwtAuthentication(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtAuthenticationMiddleware>();
        }
    }
}