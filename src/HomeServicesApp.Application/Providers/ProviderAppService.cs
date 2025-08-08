using System;
using System.Threading.Tasks;
using HomeServicesApp.Providers;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using System.Collections.Generic;
using System.Linq;
using Volo.Abp.Identity;
using HomeServicesApp.Users;
using HomeServicesApp.Notifications;

namespace HomeServicesApp.Providers
{
    [Authorize]
    public class ProviderAppService : ApplicationService, IProviderAppService
    {
        private readonly IRepository<Provider, Guid> _providerRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IEmailSender _emailSender;
        private readonly IIdentityUserRepository _userRepository;
        private readonly ISmsSender _smsSender;
        private readonly IPushNotificationSender _pushSender;
        private static List<string> _notificationHistory = new List<string>();
        private readonly IUserProfileAppService _userProfileAppService;
        private readonly FirebasePushNotificationService _pushNotificationService;

        public ProviderAppService(
            IRepository<Provider, Guid> providerRepository, ICurrentUser currentUser, IEmailSender emailSender, IIdentityUserRepository userRepository, ISmsSender smsSender, IPushNotificationSender pushSender,
            IUserProfileAppService userProfileAppService, FirebasePushNotificationService pushNotificationService)
        {
            _providerRepository = providerRepository;
            _currentUser = currentUser;
            _emailSender = emailSender;
            _userRepository = userRepository;
            _smsSender = smsSender;
            _pushSender = pushSender;
            _userProfileAppService = userProfileAppService;
            _pushNotificationService = pushNotificationService;
        }

        public async Task<ProviderDto> GetByCurrentUserAsync()
        {
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == _currentUser.GetId());
            if (provider == null) return null;
            return new ProviderDto
            {
                Id = provider.Id,
                UserId = provider.UserId,
                Specialization = provider.Specialization,
                Bio = provider.Bio,
                AverageRating = provider.AverageRating,
                TotalOrders = provider.TotalOrders,
                IsAvailable = provider.IsAvailable
            };
        }

        public async Task<ProviderDto> UpdateAsync(UpdateProviderDto input)
        {
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == _currentUser.GetId());
            if (provider == null) return null;
            provider.Specialization = input.Specialization;
            provider.Bio = input.Bio;
            provider.IsAvailable = input.IsAvailable;
            provider.IdAttachmentPath = input.IdAttachmentPath;
            provider.CRAttachmentPath = input.CRAttachmentPath;
            provider.Address = input.Address;
            provider.BusinessLicenseAttachmentPath = input.BusinessLicenseAttachmentPath;
            await _providerRepository.UpdateAsync(provider);
            return await GetByCurrentUserAsync();
        }

        public async Task<string> GetMyApprovalStatusAsync()
        {
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == _currentUser.GetId());
            return provider?.ApprovalStatus ?? "NotRegistered";
        }

        // Call this after approval
        private async Task NotifyProviderApprovedAsync(Provider provider)
        {
            var user = await _userRepository.GetAsync(provider.UserId);
            if (!string.IsNullOrEmpty(user.Email))
            {
                await _emailSender.SendEmailAsync(user.Email, "Your Provider Account is Approved", $"Congratulations {user.Name}, your provider account has been approved.");
            }
            if (!string.IsNullOrEmpty(user.PhoneNumber))
            {
                await _smsSender.SendSmsAsync(user.PhoneNumber, "Your provider account is approved.");
            }
            var fcmToken = await _userProfileAppService.GetFcmTokenAsync();
            if (!string.IsNullOrEmpty(fcmToken))
            {
                await _pushNotificationService.SendNotificationAsync(fcmToken, "Provider Approved", "Your provider account is approved.");
            }
            _notificationHistory.Add($"Approved: {user.Email} at {System.DateTime.UtcNow}");
        }

        // Call this after rejection
        private async Task NotifyProviderRejectedAsync(Provider provider)
        {
            var user = await _userRepository.GetAsync(provider.UserId);
            if (!string.IsNullOrEmpty(user.Email))
            {
                await _emailSender.SendEmailAsync(user.Email, "Your Provider Account is Rejected", $"Sorry {user.Name}, your provider account has been rejected. Please contact support. Reason: {provider.RejectionReason}");
            }
            if (!string.IsNullOrEmpty(user.PhoneNumber))
            {
                await _smsSender.SendSmsAsync(user.PhoneNumber, "Your provider account is rejected.");
            }
            var fcmToken = await _userProfileAppService.GetFcmTokenAsync();
            if (!string.IsNullOrEmpty(fcmToken))
            {
                await _pushNotificationService.SendNotificationAsync(fcmToken, "Provider Rejected", $"Your provider account is rejected. Reason: {provider.RejectionReason}");
            }
            _notificationHistory.Add($"Rejected: {user.Email} at {System.DateTime.UtcNow}");
        }

        public List<string> GetNotificationHistory()
        {
            return _notificationHistory.ToList();
        }

        [Authorize("Admin")]
        public async Task<List<ProviderDto>> GetAllAsync()
        {
            var providers = await _providerRepository.GetListAsync();
            return providers.Select(p => new ProviderDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Specialization = p.Specialization,
                Bio = p.Bio,
                AverageRating = p.AverageRating,
                TotalOrders = p.TotalOrders,
                IsAvailable = p.IsAvailable,
                ApprovalStatus = p.ApprovalStatus,
                IdAttachmentPath = p.IdAttachmentPath,
                CRAttachmentPath = p.CRAttachmentPath
            }).ToList();
        }

        [Authorize("Admin")]
        public async Task<ProviderDto> GetByIdAsync(Guid id)
        {
            var provider = await _providerRepository.GetAsync(id);
            return new ProviderDto
            {
                Id = provider.Id,
                UserId = provider.UserId,
                Specialization = provider.Specialization,
                Bio = provider.Bio,
                AverageRating = provider.AverageRating,
                TotalOrders = provider.TotalOrders,
                IsAvailable = provider.IsAvailable,
                ApprovalStatus = provider.ApprovalStatus,
                IdAttachmentPath = provider.IdAttachmentPath,
                CRAttachmentPath = provider.CRAttachmentPath
            };
        }

        public async Task ApproveAsync(Guid id)
        {
            var provider = await _providerRepository.GetAsync(id);
            provider.ApprovalStatus = "Approved";
            await _providerRepository.UpdateAsync(provider);
            await NotifyProviderApprovedAsync(provider);
        }

        public async Task RejectAsync(Guid id, string reason = null)
        {
            var provider = await _providerRepository.GetAsync(id);
            provider.ApprovalStatus = "Rejected";
            provider.RejectionReason = reason ?? string.Empty;
            await _providerRepository.UpdateAsync(provider);
            await NotifyProviderRejectedAsync(provider);
        }

        public async Task<List<ProviderDto>> SearchProvidersAsync(ProviderSearchDto input)
        {
            var queryable = await _providerRepository.GetQueryableAsync();
            
            if (!string.IsNullOrWhiteSpace(input.Specialization))
                queryable = queryable.Where(x => x.Specialization.Contains(input.Specialization));
            
            if (!string.IsNullOrWhiteSpace(input.ApprovalStatus))
                queryable = queryable.Where(x => x.ApprovalStatus == input.ApprovalStatus);
            
            if (input.IsAvailable.HasValue)
                queryable = queryable.Where(x => x.IsAvailable == input.IsAvailable.Value);
            
            if (input.MinRating.HasValue)
                queryable = queryable.Where(x => x.AverageRating >= input.MinRating.Value);

            var providers = queryable.ToList();
            return providers.Select(p => new ProviderDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Specialization = p.Specialization,
                Bio = p.Bio,
                AverageRating = p.AverageRating,
                TotalOrders = p.TotalOrders,
                IsAvailable = p.IsAvailable,
                ApprovalStatus = p.ApprovalStatus
            }).ToList();
        }

        public async Task<ProviderStatsDto> GetProviderStatsAsync(Guid providerId)
        {
            var provider = await _providerRepository.GetAsync(providerId);
            return new ProviderStatsDto
            {
                ProviderId = providerId,
                TotalOrders = provider.TotalOrders,
                AverageRating = provider.AverageRating,
                WalletBalance = provider.WalletBalance,
                CompletedOrders = provider.TotalOrders,
                PendingOrders = 0,
                MonthlyEarnings = provider.WalletBalance
            };
        }

        public async Task<List<ProviderDto>> GetProvidersByCategoryAsync(string category)
        {
            var providers = await _providerRepository.GetListAsync(x => x.Specialization.Contains(category));
            return providers.Select(p => new ProviderDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Specialization = p.Specialization,
                Bio = p.Bio,
                AverageRating = p.AverageRating,
                TotalOrders = p.TotalOrders,
                IsAvailable = p.IsAvailable
            }).ToList();
        }

        public async Task<ProviderDto> UpdateProviderAvailabilityAsync(Guid providerId, List<ProviderAvailabilityDto> availability)
        {
            var provider = await _providerRepository.GetAsync(providerId);
            provider.IsAvailable = availability.Any(a => a.IsAvailable);
            await _providerRepository.UpdateAsync(provider);
            return await GetByIdAsync(providerId);
        }

        public async Task<List<ProviderDto>> GetNearbyProvidersAsync(double latitude, double longitude, double radiusKm)
        {
            var providers = await _providerRepository.GetListAsync(x => x.IsAvailable && x.ApprovalStatus == "Approved");
            return providers.Select(p => new ProviderDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Specialization = p.Specialization,
                Bio = p.Bio,
                AverageRating = p.AverageRating,
                TotalOrders = p.TotalOrders,
                IsAvailable = p.IsAvailable
            }).ToList();
        }

        public async Task<ProviderDto> VerifyProviderDocumentAsync(Guid providerId, string documentType)
        {
            var provider = await _providerRepository.GetAsync(providerId);
            provider.ApprovalStatus = "Verified";
            await _providerRepository.UpdateAsync(provider);
            return await GetByIdAsync(providerId);
        }

        public async Task<List<ProviderDto>> GetTopRatedProvidersAsync(int count)
        {
            var providers = await _providerRepository.GetListAsync();
            return providers
                .Where(p => p.ApprovalStatus == "Approved")
                .OrderByDescending(p => p.AverageRating)
                .Take(count)
                .Select(p => new ProviderDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    Specialization = p.Specialization,
                    Bio = p.Bio,
                    AverageRating = p.AverageRating,
                    TotalOrders = p.TotalOrders,
                    IsAvailable = p.IsAvailable
                }).ToList();
        }
    }

    public interface IProviderAppService
    {
        Task<ProviderDto> GetByCurrentUserAsync();
        Task<ProviderDto> UpdateAsync(UpdateProviderDto input);
        Task<List<ProviderDto>> GetAllAsync();
        Task<ProviderDto> GetByIdAsync(Guid id);
        Task ApproveAsync(Guid id);
        Task RejectAsync(Guid id, string reason = null);
        Task<string> GetMyApprovalStatusAsync();
        List<string> GetNotificationHistory();
        Task<List<ProviderDto>> SearchProvidersAsync(ProviderSearchDto input);
        Task<ProviderStatsDto> GetProviderStatsAsync(Guid providerId);
        Task<List<ProviderDto>> GetProvidersByCategoryAsync(string category);
        Task<ProviderDto> UpdateProviderAvailabilityAsync(Guid providerId, List<ProviderAvailabilityDto> availability);
        Task<List<ProviderDto>> GetNearbyProvidersAsync(double latitude, double longitude, double radiusKm);
        Task<ProviderDto> VerifyProviderDocumentAsync(Guid providerId, string documentType);
        Task<List<ProviderDto>> GetTopRatedProvidersAsync(int count);
    }
}  