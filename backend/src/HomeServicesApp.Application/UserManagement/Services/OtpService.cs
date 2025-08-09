using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.DependencyInjection;

namespace HomeServicesApp.UserManagement.Services
{
    public interface IOtpService
    {
        Task<string> GenerateOtpAsync(Guid userId, string email, string purpose, string phoneNumber = null, string ipAddress = null, string userAgent = null);
        Task<bool> ValidateOtpAsync(string email, string code, string purpose);
        Task<OtpValidationResult> ValidateOtpWithDetailsAsync(string email, string code, string purpose);
        Task InvalidateAllOtpsAsync(Guid userId, string purpose);
        Task<OtpToken> GetActiveOtpAsync(string email, string purpose);
        string GenerateNumericOtp(int length = 6);
        string GenerateAlphanumericOtp(int length = 8);
    }

    public class OtpService : IOtpService, ITransientDependency
    {
        private readonly IOtpTokenRepository _otpTokenRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<OtpService> _logger;
        private readonly IConfiguration _configuration;

        public OtpService(
            IOtpTokenRepository otpTokenRepository,
            IEmailService emailService,
            ILogger<OtpService> logger,
            IConfiguration configuration)
        {
            _otpTokenRepository = otpTokenRepository;
            _emailService = emailService;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<string> GenerateOtpAsync(Guid userId, string email, string purpose, string phoneNumber = null, string ipAddress = null, string userAgent = null)
        {
            try
            {
                // Invalidate any existing OTPs for this user and purpose
                await InvalidateAllOtpsAsync(userId, purpose);

                // Generate OTP code
                var otpLength = GetOtpLength(purpose);
                var otpCode = purpose == OtpPurpose.Login ? GenerateNumericOtp(otpLength) : GenerateAlphanumericOtp(otpLength);

                // Set expiry time based on purpose
                var expiryMinutes = GetOtpExpiryMinutes(purpose);
                var expiryDate = DateTime.UtcNow.AddMinutes(expiryMinutes);

                // Create OTP token
                var otpToken = new OtpToken(
                    GuidGenerator.Create(),
                    userId,
                    otpCode,
                    email,
                    purpose,
                    expiryDate,
                    phoneNumber,
                    ipAddress,
                    userAgent,
                    GetMaxAttempts(purpose)
                );

                await _otpTokenRepository.InsertAsync(otpToken);

                // Send OTP via email
                var user = await GetUserByIdAsync(userId);
                await _emailService.SendOtpCodeAsync(email, user?.Username ?? "User", otpCode, purpose);

                _logger.LogInformation("OTP generated for user {UserId} with purpose {Purpose}", userId, purpose);

                return otpCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate OTP for user {UserId} with purpose {Purpose}", userId, purpose);
                throw new UserFriendlyException("Failed to generate verification code. Please try again.");
            }
        }

        public async Task<bool> ValidateOtpAsync(string email, string code, string purpose)
        {
            var result = await ValidateOtpWithDetailsAsync(email, code, purpose);
            return result.IsValid;
        }

        public async Task<OtpValidationResult> ValidateOtpWithDetailsAsync(string email, string code, string purpose)
        {
            try
            {
                var otpToken = await _otpTokenRepository.GetActiveOtpAsync(email, purpose);

                if (otpToken == null)
                {
                    return new OtpValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "No verification code found for this email.",
                        ErrorCode = "OTP_NOT_FOUND"
                    };
                }

                if (otpToken.IsExpired())
                {
                    return new OtpValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "Verification code has expired. Please request a new one.",
                        ErrorCode = "OTP_EXPIRED"
                    };
                }

                if (otpToken.AttemptCount >= otpToken.MaxAttempts)
                {
                    return new OtpValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "Maximum verification attempts exceeded. Please request a new code.",
                        ErrorCode = "OTP_MAX_ATTEMPTS"
                    };
                }

                // Verify the code
                var isValid = otpToken.VerifyCode(code);
                await _otpTokenRepository.UpdateAsync(otpToken);

                if (isValid)
                {
                    _logger.LogInformation("OTP validated successfully for email {Email} with purpose {Purpose}", email, purpose);
                    
                    return new OtpValidationResult
                    {
                        IsValid = true,
                        UserId = otpToken.UserId,
                        Email = otpToken.Email
                    };
                }
                else
                {
                    var remainingAttempts = otpToken.GetRemainingAttempts();
                    _logger.LogWarning("Invalid OTP attempt for email {Email} with purpose {Purpose}. Remaining attempts: {RemainingAttempts}", 
                        email, purpose, remainingAttempts);

                    return new OtpValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = $"Invalid verification code. You have {remainingAttempts} attempts remaining.",
                        ErrorCode = "OTP_INVALID",
                        RemainingAttempts = remainingAttempts
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating OTP for email {Email} with purpose {Purpose}", email, purpose);
                throw new UserFriendlyException("Failed to validate verification code. Please try again.");
            }
        }

        public async Task InvalidateAllOtpsAsync(Guid userId, string purpose)
        {
            var activeOtps = await _otpTokenRepository.GetActiveOtpsByUserAsync(userId, purpose);
            
            foreach (var otp in activeOtps)
            {
                otp.MarkAsUsed();
                await _otpTokenRepository.UpdateAsync(otp);
            }

            _logger.LogInformation("Invalidated {Count} active OTPs for user {UserId} with purpose {Purpose}", 
                activeOtps.Count, userId, purpose);
        }

        public async Task<OtpToken> GetActiveOtpAsync(string email, string purpose)
        {
            return await _otpTokenRepository.GetActiveOtpAsync(email, purpose);
        }

        public string GenerateNumericOtp(int length = 6)
        {
            if (length < 4 || length > 10)
                throw new ArgumentException("OTP length must be between 4 and 10 digits");

            var random = new Random();
            var otp = "";
            
            for (int i = 0; i < length; i++)
            {
                otp += random.Next(0, 10).ToString();
            }

            // Ensure it doesn't start with 0 and isn't all the same digit
            if (otp.StartsWith("0") || otp.All(c => c == otp[0]))
            {
                return GenerateNumericOtp(length); // Regenerate if it starts with 0 or all same digits
            }

            return otp;
        }

        public string GenerateAlphanumericOtp(int length = 8)
        {
            if (length < 6 || length > 12)
                throw new ArgumentException("OTP length must be between 6 and 12 characters");

            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var otp = new char[length];

            for (int i = 0; i < length; i++)
            {
                otp[i] = chars[random.Next(chars.Length)];
            }

            return new string(otp);
        }

        private int GetOtpLength(string purpose)
        {
            return purpose switch
            {
                OtpPurpose.Login => int.Parse(_configuration["OTP:LoginLength"] ?? "6"),
                OtpPurpose.PasswordReset => int.Parse(_configuration["OTP:PasswordResetLength"] ?? "8"),
                OtpPurpose.EmailVerification => int.Parse(_configuration["OTP:EmailVerificationLength"] ?? "6"),
                OtpPurpose.TwoFactorAuth => int.Parse(_configuration["OTP:TwoFactorLength"] ?? "6"),
                _ => 6
            };
        }

        private int GetOtpExpiryMinutes(string purpose)
        {
            return purpose switch
            {
                OtpPurpose.Login => int.Parse(_configuration["OTP:LoginExpiryMinutes"] ?? "10"),
                OtpPurpose.PasswordReset => int.Parse(_configuration["OTP:PasswordResetExpiryMinutes"] ?? "15"),
                OtpPurpose.EmailVerification => int.Parse(_configuration["OTP:EmailVerificationExpiryMinutes"] ?? "30"),
                OtpPurpose.TwoFactorAuth => int.Parse(_configuration["OTP:TwoFactorExpiryMinutes"] ?? "5"),
                _ => 10
            };
        }

        private int GetMaxAttempts(string purpose)
        {
            return purpose switch
            {
                OtpPurpose.Login => int.Parse(_configuration["OTP:LoginMaxAttempts"] ?? "3"),
                OtpPurpose.PasswordReset => int.Parse(_configuration["OTP:PasswordResetMaxAttempts"] ?? "5"),
                OtpPurpose.EmailVerification => int.Parse(_configuration["OTP:EmailVerificationMaxAttempts"] ?? "3"),
                OtpPurpose.TwoFactorAuth => int.Parse(_configuration["OTP:TwoFactorMaxAttempts"] ?? "3"),
                _ => 3
            };
        }

        private async Task<User> GetUserByIdAsync(Guid userId)
        {
            // This would be implemented to get user from repository
            // Placeholder implementation
            return new User { Username = "User" };
        }
    }

    public class OtpValidationResult
    {
        public bool IsValid { get; set; }
        public Guid? UserId { get; set; }
        public string Email { get; set; }
        public string ErrorMessage { get; set; }
        public string ErrorCode { get; set; }
        public int? RemainingAttempts { get; set; }
    }

    // Repository interface that would be implemented in the infrastructure layer
    public interface IOtpTokenRepository
    {
        Task<OtpToken> InsertAsync(OtpToken otpToken);
        Task<OtpToken> UpdateAsync(OtpToken otpToken);
        Task<OtpToken> GetActiveOtpAsync(string email, string purpose);
        Task<List<OtpToken>> GetActiveOtpsByUserAsync(Guid userId, string purpose);
        Task DeleteExpiredOtpsAsync();
    }
}