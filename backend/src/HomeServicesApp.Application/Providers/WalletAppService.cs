using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Providers;
using HomeServicesApp.Notifications;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using Microsoft.AspNetCore.Authorization;

namespace HomeServicesApp.Providers
{
    [Authorize]
    public class WalletAppService : ApplicationService, IWalletAppService
    {
        private readonly IRepository<Provider, Guid> _providerRepository;
        private readonly IRepository<WithdrawalRequest, Guid> _withdrawalRepository;
        private readonly ICurrentUser _currentUser;

        public WalletAppService(
            IRepository<Provider, Guid> providerRepository,
            IRepository<WithdrawalRequest, Guid> withdrawalRepository,
            ICurrentUser currentUser)
        {
            _providerRepository = providerRepository;
            _withdrawalRepository = withdrawalRepository;
            _currentUser = currentUser;
        }

        public async Task<decimal> GetMyWalletBalanceAsync()
        {
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == _currentUser.GetId());
            return provider?.WalletBalance ?? 0;
        }

        public async Task<List<WithdrawalRequestDto>> GetMyWithdrawalRequestsAsync()
        {
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == _currentUser.GetId());
            if (provider == null) return new List<WithdrawalRequestDto>();
            var requests = await _withdrawalRepository.GetListAsync(x => x.ProviderId == provider.Id);
            return requests.OrderByDescending(x => x.RequestDate)
                .Select(x => new WithdrawalRequestDto
                {
                    Id = x.Id,
                    Amount = x.Amount,
                    Status = x.Status,
                    RequestDate = x.RequestDate,
                    ProcessedDate = x.ProcessedDate
                }).ToList();
        }

        public async Task RequestWithdrawalAsync(decimal amount)
        {
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == _currentUser.GetId());
            if (provider == null) throw new Exception("Provider not found");
            if (amount > provider.WalletBalance) throw new Exception("Insufficient balance");
            await _withdrawalRepository.InsertAsync(new WithdrawalRequest
            {
                ProviderId = provider.Id,
                Amount = amount,
                Status = "جديد",
                RequestDate = DateTime.Now
            });
            provider.WalletBalance -= amount;
            await _providerRepository.UpdateAsync(provider);
        }
    }

    public interface IWalletAppService
    {
        Task<decimal> GetMyWalletBalanceAsync();
        Task<List<WithdrawalRequestDto>> GetMyWithdrawalRequestsAsync();
        Task RequestWithdrawalAsync(decimal amount);
    }

    public class WithdrawalRequestDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime? ProcessedDate { get; set; }
    }
} 