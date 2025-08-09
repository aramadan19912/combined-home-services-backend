using System;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace HomeServicesApp.UserManagement.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string username, string resetToken, string resetLink);
        Task SendOtpCodeAsync(string email, string username, string otpCode, string purpose);
        Task SendWelcomeEmailAsync(string email, string username);
        Task SendAccountLockoutNotificationAsync(string email, string username, DateTime lockoutEndTime);
        Task SendPasswordChangeNotificationAsync(string email, string username);
    }

    public class EmailService : IEmailService, ITransientDependency
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string email, string username, string resetToken, string resetLink)
        {
            var subject = "Password Reset Request";
            var body = GeneratePasswordResetEmailBody(username, resetToken, resetLink);
            
            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendOtpCodeAsync(string email, string username, string otpCode, string purpose)
        {
            var subject = GetOtpSubject(purpose);
            var body = GenerateOtpEmailBody(username, otpCode, purpose);
            
            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendWelcomeEmailAsync(string email, string username)
        {
            var subject = "Welcome to HomeServices";
            var body = GenerateWelcomeEmailBody(username);
            
            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendAccountLockoutNotificationAsync(string email, string username, DateTime lockoutEndTime)
        {
            var subject = "Account Security Alert - Account Locked";
            var body = GenerateAccountLockoutEmailBody(username, lockoutEndTime);
            
            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendPasswordChangeNotificationAsync(string email, string username)
        {
            var subject = "Password Changed Successfully";
            var body = GeneratePasswordChangeEmailBody(username);
            
            await SendEmailAsync(email, subject, body, true);
        }

        private async Task SendEmailAsync(string to, string subject, string body, bool isHtml = false)
        {
            try
            {
                var smtpSettings = GetSmtpSettings();
                
                using var client = new SmtpClient(smtpSettings.Host, smtpSettings.Port);
                client.EnableSsl = smtpSettings.EnableSsl;
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(smtpSettings.Username, smtpSettings.Password);

                using var message = new MailMessage();
                message.From = new MailAddress(smtpSettings.FromEmail, smtpSettings.FromName);
                message.To.Add(to);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = isHtml;
                message.BodyEncoding = Encoding.UTF8;

                await client.SendMailAsync(message);
                
                _logger.LogInformation("Email sent successfully to {Email} with subject: {Subject}", to, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email} with subject: {Subject}", to, subject);
                throw new Exception($"Failed to send email: {ex.Message}");
            }
        }

        private SmtpSettings GetSmtpSettings()
        {
            return new SmtpSettings
            {
                Host = _configuration["Email:Smtp:Host"] ?? "localhost",
                Port = int.Parse(_configuration["Email:Smtp:Port"] ?? "587"),
                EnableSsl = bool.Parse(_configuration["Email:Smtp:EnableSsl"] ?? "true"),
                Username = _configuration["Email:Smtp:Username"] ?? "",
                Password = _configuration["Email:Smtp:Password"] ?? "",
                FromEmail = _configuration["Email:FromEmail"] ?? "noreply@homeservices.com",
                FromName = _configuration["Email:FromName"] ?? "HomeServices"
            };
        }

        private string GetOtpSubject(string purpose)
        {
            return purpose switch
            {
                OtpPurpose.Login => "Your Login Verification Code",
                OtpPurpose.PasswordReset => "Password Reset Verification Code",
                OtpPurpose.EmailVerification => "Email Verification Code",
                OtpPurpose.TwoFactorAuth => "Two-Factor Authentication Code",
                _ => "Verification Code"
            };
        }

        private string GeneratePasswordResetEmailBody(string username, string resetToken, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background: #f9f9f9; }}
        .button {{ background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }}
        .code {{ background: #e8f4fd; border: 1px solid #b8daff; padding: 15px; margin: 15px 0; font-family: monospace; font-size: 18px; text-align: center; border-radius: 4px; }}
        .footer {{ background: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px; }}
        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Password Reset Request</h1>
        </div>
        <div class='content'>
            <h2>Hello {username},</h2>
            <p>We received a request to reset your password for your HomeServices account.</p>
            
            <div class='code'>
                <strong>Reset Code: {resetToken}</strong>
            </div>
            
            <p>You can also click the button below to reset your password:</p>
            <a href='{resetLink}' class='button'>Reset Password</a>
            
            <div class='warning'>
                <strong>Security Notice:</strong>
                <ul>
                    <li>This code will expire in 15 minutes</li>
                    <li>Don't share this code with anyone</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                </ul>
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
            <p style='word-break: break-all; color: #666;'>{resetLink}</p>
        </div>
        <div class='footer'>
            <p>&copy; 2024 HomeServices. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateOtpEmailBody(string username, string otpCode, string purpose)
        {
            var purposeText = purpose switch
            {
                OtpPurpose.Login => "login to your account",
                OtpPurpose.PasswordReset => "reset your password",
                OtpPurpose.EmailVerification => "verify your email address",
                OtpPurpose.TwoFactorAuth => "complete two-factor authentication",
                _ => "verify your identity"
            };

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background: #f9f9f9; }}
        .otp-code {{ background: #e8f4fd; border: 2px solid #007bff; padding: 20px; margin: 20px 0; font-family: monospace; font-size: 32px; font-weight: bold; text-align: center; border-radius: 8px; letter-spacing: 4px; }}
        .footer {{ background: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px; }}
        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }}
        .timer {{ background: #f8d7da; border-left: 4px solid #dc3545; padding: 10px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Verification Code</h1>
        </div>
        <div class='content'>
            <h2>Hello {username},</h2>
            <p>Use the following verification code to {purposeText}:</p>
            
            <div class='otp-code'>
                {otpCode}
            </div>
            
            <div class='timer'>
                <strong>⏰ Time Sensitive:</strong> This code expires in 10 minutes
            </div>
            
            <div class='warning'>
                <strong>Security Tips:</strong>
                <ul>
                    <li>Enter this code only on the official HomeServices website</li>
                    <li>Never share this code with anyone</li>
                    <li>Our team will never ask for this code via phone or email</li>
                </ul>
            </div>
            
            <p>If you didn't request this verification code, please ignore this email and ensure your account is secure.</p>
        </div>
        <div class='footer'>
            <p>&copy; 2024 HomeServices. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateWelcomeEmailBody(string username)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background: #f9f9f9; }}
        .button {{ background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }}
        .footer {{ background: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px; }}
        .feature {{ background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Welcome to HomeServices!</h1>
        </div>
        <div class='content'>
            <h2>Hello {username},</h2>
            <p>Welcome to HomeServices! We're excited to have you on board.</p>
            
            <h3>What you can do now:</h3>
            <div class='feature'>
                <strong>🏠 Browse Services</strong><br>
                Discover a wide range of home services from trusted professionals.
            </div>
            <div class='feature'>
                <strong>📅 Schedule Appointments</strong><br>
                Book services at your convenience with our easy scheduling system.
            </div>
            <div class='feature'>
                <strong>💬 Track Progress</strong><br>
                Stay updated on your service requests and communicate with providers.
            </div>
            
            <p>Ready to get started?</p>
            <a href='#' class='button'>Explore Services</a>
            
            <p>If you have any questions, our support team is here to help!</p>
        </div>
        <div class='footer'>
            <p>&copy; 2024 HomeServices. All rights reserved.</p>
            <p>Need help? Contact us at support@homeservices.com</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateAccountLockoutEmailBody(string username, DateTime lockoutEndTime)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
        .header {{ background: #dc3545; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background: #f9f9f9; }}
        .alert {{ background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 15px 0; border-radius: 4px; }}
        .footer {{ background: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⚠️ Account Security Alert</h1>
        </div>
        <div class='content'>
            <h2>Hello {username},</h2>
            
            <div class='alert'>
                <strong>Your account has been temporarily locked</strong><br>
                Due to multiple failed login attempts, your account has been locked until: <strong>{lockoutEndTime:yyyy-MM-dd HH:mm} UTC</strong>
            </div>
            
            <p><strong>What happened?</strong></p>
            <p>We detected 5 consecutive failed login attempts on your account, which triggered our security protection.</p>
            
            <p><strong>What you can do:</strong></p>
            <ul>
                <li>Wait until the lockout period expires and try logging in again</li>
                <li>Make sure you're using the correct password</li>
                <li>Consider resetting your password if you've forgotten it</li>
            </ul>
            
            <p><strong>If this wasn't you:</strong></p>
            <p>If you didn't attempt to log in, someone may be trying to access your account. Please contact our support team immediately.</p>
        </div>
        <div class='footer'>
            <p>&copy; 2024 HomeServices. All rights reserved.</p>
            <p>Contact support: security@homeservices.com</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GeneratePasswordChangeEmailBody(string username)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
        .header {{ background: #28a745; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background: #f9f9f9; }}
        .success {{ background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 15px 0; border-radius: 4px; }}
        .footer {{ background: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>✅ Password Changed Successfully</h1>
        </div>
        <div class='content'>
            <h2>Hello {username},</h2>
            
            <div class='success'>
                <strong>Your password has been changed successfully!</strong><br>
                Your account is now secured with your new password.
            </div>
            
            <p><strong>Change Details:</strong></p>
            <ul>
                <li>Date: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC</li>
                <li>Account: {username}</li>
            </ul>
            
            <p><strong>If this wasn't you:</strong></p>
            <p>If you didn't change your password, please contact our support team immediately as your account may be compromised.</p>
            
            <p><strong>Security Tips:</strong></p>
            <ul>
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Consider enabling two-factor authentication</li>
                <li>Never share your password with anyone</li>
            </ul>
        </div>
        <div class='footer'>
            <p>&copy; 2024 HomeServices. All rights reserved.</p>
            <p>Contact support: security@homeservices.com</p>
        </div>
    </div>
</body>
</html>";
        }
    }

    public class SmtpSettings
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public bool EnableSsl { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string FromEmail { get; set; }
        public string FromName { get; set; }
    }
}