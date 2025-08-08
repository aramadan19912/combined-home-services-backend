using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Providers;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace HomeServicesApp.Admin
{
    [Authorize("Admin")]
    public class WithdrawalRequestAdminAppService : ApplicationService, IWithdrawalRequestAdminAppService
    {
        private readonly IRepository<WithdrawalRequest, Guid> _withdrawalRepository;
        private readonly IRepository<Provider, Guid> _providerRepository;

        public WithdrawalRequestAdminAppService(
            IRepository<WithdrawalRequest, Guid> withdrawalRepository,
            IRepository<Provider, Guid> providerRepository)
        {
            _withdrawalRepository = withdrawalRepository;
            _providerRepository = providerRepository;
        }

        public async Task<List<WithdrawalRequestDto>> GetAllWithdrawalRequestsAsync()
        {
            var requests = await _withdrawalRepository.GetListAsync();
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

        public async Task ApproveWithdrawalAsync(Guid requestId)
        {
            var request = await _withdrawalRepository.GetAsync(requestId);
            request.Status = "مقبول";
            request.ProcessedDate = DateTime.Now;
            await _withdrawalRepository.UpdateAsync(request);
            // هنا يمكنك تنفيذ التحويل البنكي أو إرسال إشعار لمقدم الخدمة
        }

        public async Task RejectWithdrawalAsync(Guid requestId)
        {
            var request = await _withdrawalRepository.GetAsync(requestId);
            request.Status = "مرفوض";
            request.ProcessedDate = DateTime.Now;
            await _withdrawalRepository.UpdateAsync(request);
            // إعادة المبلغ إلى المحفظة
            var provider = await _providerRepository.GetAsync(request.ProviderId);
            provider.WalletBalance += request.Amount;
            await _providerRepository.UpdateAsync(provider);
        }
    }

    public interface IWithdrawalRequestAdminAppService
    {
        Task<List<WithdrawalRequestDto>> GetAllWithdrawalRequestsAsync();
        Task ApproveWithdrawalAsync(Guid requestId);
        Task RejectWithdrawalAsync(Guid requestId);
    }
} 