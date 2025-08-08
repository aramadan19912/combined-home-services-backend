using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Loyalty;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace HomeServicesApp.Loyalty
{
    [Authorize]
    public class LoyaltyPointAppService : ApplicationService, ILoyaltyPointAppService
    {
        private readonly IRepository<LoyaltyPoint, Guid> _loyaltyPointRepository;
        private readonly ICurrentUser _currentUser;

        public LoyaltyPointAppService(IRepository<LoyaltyPoint, Guid> loyaltyPointRepository, ICurrentUser currentUser)
        {
            _loyaltyPointRepository = loyaltyPointRepository;
            _currentUser = currentUser;
        }

        public async Task<List<LoyaltyPointDto>> GetMyPointsAsync()
        {
            var userId = _currentUser.GetId();
            var points = await _loyaltyPointRepository.GetListAsync(x => x.UserId == userId);
            return points.OrderByDescending(x => x.CreationTime)
                .Select(x => new LoyaltyPointDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Points = x.Points,
                    Reason = x.Reason,
                    CreationTime = x.CreationTime
                }).ToList();
        }

        public async Task<int> GetMyTotalPointsAsync()
        {
            var userId = _currentUser.GetId();
            var points = await _loyaltyPointRepository.GetListAsync(x => x.UserId == userId);
            return points.Sum(x => x.Points);
        }

        public async Task RedeemPointsAsync(RedeemPointsDto input)
        {
            var userId = _currentUser.GetId();
            var totalPoints = await GetMyTotalPointsAsync();
            if (input.Points > totalPoints)
                throw new Volo.Abp.UserFriendlyException("Not enough points.");
            await _loyaltyPointRepository.InsertAsync(new LoyaltyPoint
            {
                UserId = userId,
                Points = -input.Points,
                Reason = input.Reason ?? "Redeem"
            });
        }

        // يمكن استدعاء هذه الدالة من OrderAppService عند إكمال الطلب
        public async Task AddPointsAsync(Guid userId, int points, string reason)
        {
            await _loyaltyPointRepository.InsertAsync(new LoyaltyPoint
            {
                UserId = userId,
                Points = points,
                Reason = reason
            });
        }
    }

    public interface ILoyaltyPointAppService
    {
        Task<List<LoyaltyPointDto>> GetMyPointsAsync();
        Task<int> GetMyTotalPointsAsync();
        Task RedeemPointsAsync(RedeemPointsDto input);
        Task AddPointsAsync(Guid userId, int points, string reason);
    }
} 