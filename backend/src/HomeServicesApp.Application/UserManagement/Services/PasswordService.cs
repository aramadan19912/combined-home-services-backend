using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Volo.Abp.DependencyInjection;

namespace HomeServicesApp.UserManagement.Services
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
        bool IsPasswordStrong(string password);
        string GenerateResetToken();
        bool IsValidResetToken(string token);
        string GenerateRandomPassword(int length = 12);
    }

    public class PasswordService : IPasswordService, ITransientDependency
    {
        private const int SaltSize = 16; // 128 bits
        private const int KeySize = 32; // 256 bits
        private const int Iterations = 100000; // PBKDF2 iterations

        public string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be null or empty", nameof(password));

            // Generate a random salt
            byte[] salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // Hash the password
            byte[] hash = KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: Iterations,
                numBytesRequested: KeySize);

            // Combine salt and hash
            byte[] combined = new byte[SaltSize + KeySize];
            Array.Copy(salt, 0, combined, 0, SaltSize);
            Array.Copy(hash, 0, combined, SaltSize, KeySize);

            return Convert.ToBase64String(combined);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hashedPassword))
                return false;

            try
            {
                // Decode the combined salt+hash
                byte[] combined = Convert.FromBase64String(hashedPassword);
                
                if (combined.Length != SaltSize + KeySize)
                    return false;

                // Extract salt and hash
                byte[] salt = new byte[SaltSize];
                byte[] hash = new byte[KeySize];
                Array.Copy(combined, 0, salt, 0, SaltSize);
                Array.Copy(combined, SaltSize, hash, 0, KeySize);

                // Hash the provided password
                byte[] testHash = KeyDerivation.Pbkdf2(
                    password: password,
                    salt: salt,
                    prf: KeyDerivationPrf.HMACSHA256,
                    iterationCount: Iterations,
                    numBytesRequested: KeySize);

                // Compare hashes
                return CryptographicOperations.FixedTimeEquals(hash, testHash);
            }
            catch
            {
                return false;
            }
        }

        public bool IsPasswordStrong(string password)
        {
            if (string.IsNullOrEmpty(password))
                return false;

            // Minimum length check
            if (password.Length < 8)
                return false;

            // Must contain at least:
            // - One lowercase letter
            // - One uppercase letter
            // - One digit
            // - One special character
            bool hasLowercase = Regex.IsMatch(password, @"[a-z]");
            bool hasUppercase = Regex.IsMatch(password, @"[A-Z]");
            bool hasDigit = Regex.IsMatch(password, @"\d");
            bool hasSpecialChar = Regex.IsMatch(password, @"[^a-zA-Z0-9]");

            return hasLowercase && hasUppercase && hasDigit && hasSpecialChar;
        }

        public string GenerateResetToken()
        {
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes);
        }

        public bool IsValidResetToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                return false;

            try
            {
                // Basic validation - check if it's a valid base64 string
                var bytes = Convert.FromBase64String(token);
                return bytes.Length >= 16; // Minimum 16 bytes
            }
            catch
            {
                return false;
            }
        }

        public string GenerateRandomPassword(int length = 12)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            var random = new char[length];
            
            using (var rng = RandomNumberGenerator.Create())
            {
                var bytes = new byte[length * 4];
                rng.GetBytes(bytes);
                
                for (int i = 0; i < length; i++)
                {
                    var value = BitConverter.ToUInt32(bytes, i * 4);
                    random[i] = chars[(int)(value % chars.Length)];
                }
            }

            var password = new string(random);
            
            // Ensure the generated password meets strength requirements
            if (!IsPasswordStrong(password))
            {
                // If not strong enough, try again (recursive call with limit)
                return GenerateRandomPassword(length);
            }

            return password;
        }
    }
}