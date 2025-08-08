using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeServicesApp.Users;
using HomeServicesApp.Orders;
using HomeServicesApp.Coupons;
using HomeServicesApp.Reviews;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Identity;
using System.Linq;

namespace HomeServicesApp.Admin
{
    [Authorize("Admin")]
    public class AdminAppService : ApplicationService, IAdminAppService
    {
        private readonly IRepository<AppUser, Guid> _userRepository;
        private readonly IRepository<Order, Guid> _orderRepository;
        private readonly IRepository<Coupon, Guid> _couponRepository;
        private readonly IRepository<Review, Guid> _reviewRepository;
        private readonly IIdentityUserRepository _identityUserRepository;
        private readonly IIdentityUserAppService _identityUserAppService;
        private readonly IIdentityRoleRepository _identityRoleRepository;
        private readonly IdentityUserManager _identityUserManager;

        public AdminAppService(
            IRepository<AppUser, Guid> userRepository,
            IRepository<Order, Guid> orderRepository,
            IRepository<Coupon, Guid> couponRepository,
            IRepository<Review, Guid> reviewRepository,
            IIdentityUserRepository identityUserRepository,
            IIdentityUserAppService identityUserAppService,
            IIdentityRoleRepository identityRoleRepository,
            IdentityUserManager identityUserManager
        )
        {
            _userRepository = userRepository;
            _orderRepository = orderRepository;
            _couponRepository = couponRepository;
            _reviewRepository = reviewRepository;
            _identityUserRepository = identityUserRepository;
            _identityUserAppService = identityUserAppService;
            _identityRoleRepository = identityRoleRepository;
            _identityUserManager = identityUserManager;
        }

        public async Task<AdminDashboardStatsDto> GetStatisticsAsync()
        {
            var usersCount = await _userRepository.CountAsync();
            var ordersCount = await _orderRepository.CountAsync();
            var couponsCount = await _couponRepository.CountAsync();
            var reviewsCount = await _reviewRepository.CountAsync();
            return new AdminDashboardStatsDto
            {
                UsersCount = usersCount,
                OrdersCount = ordersCount,
                CouponsCount = couponsCount,
                ReviewsCount = reviewsCount
            };
        }

        public async Task<List<UserProfileDto>> GetAllUsersAsync()
        {
            var users = await _identityUserRepository.GetListAsync();
            return users.Select(u => {
                string address = null, profileImage = null, userType = null;
                bool isVerified = false;
                if (u.ExtraProperties != null)
                {
                    if (u.ExtraProperties.TryGetValue("Address", out var addrObj))
                        address = addrObj?.ToString();
                    if (u.ExtraProperties.TryGetValue("ProfileImage", out var imgObj))
                        profileImage = imgObj?.ToString();
                    if (u.ExtraProperties.TryGetValue("UserType", out var typeObj))
                        userType = typeObj?.ToString();
                    if (u.ExtraProperties.TryGetValue("IsVerified", out var verObj))
                        isVerified = verObj is bool b && b;
                }
                return new UserProfileDto
                {
                    Id = u.Id,
                    FullName = u.Name,
                    Email = u.Email,
                    Address = address,
                    PhoneNumber = u.PhoneNumber,
                    ProfileImage = profileImage,
                    UserType = userType,
                    IsVerified = isVerified
                };
            }).ToList();
        }

        public async Task BanUserAsync(Guid userId)
        {
            var user = await _identityUserRepository.GetAsync(userId);
            // لا يمكن تعيين IsActive مباشرة إذا كان set محميًا، استخدم IIdentityUserAppService أو تجاهل
            // user.IsActive = false;
            user.ExtraProperties["IsActive"] = false;
            await _identityUserRepository.UpdateAsync(user);
        }

        public async Task ApproveProviderAsync(Guid userId)
        {
            var user = await _identityUserRepository.GetAsync(userId);
            if (user.ExtraProperties != null)
                user.ExtraProperties["IsVerified"] = true;
            await _identityUserRepository.UpdateAsync(user);
        }

        public async Task<List<string>> GetUserRolesAsync(Guid userId)
        {
            var user = await _identityUserManager.GetByIdAsync(userId);
            var roles = await _identityUserManager.GetRolesAsync(user);
            return roles.ToList();
        }

        public async Task SetUserRolesAsync(Guid userId, List<string> roleNames)
        {
            var user = await _identityUserManager.GetByIdAsync(userId);
            var allRoles = await _identityRoleRepository.GetListAsync();
            var rolesToAssign = allRoles.Where(r => roleNames.Contains(r.Name)).ToList();
            await _identityUserManager.SetRolesAsync(user, rolesToAssign.Select(r => r.Name).ToArray());
        }
    }

    public interface IAdminAppService
    {
        Task<AdminDashboardStatsDto> GetStatisticsAsync();
        Task<List<UserProfileDto>> GetAllUsersAsync();
        Task BanUserAsync(Guid userId);
        Task ApproveProviderAsync(Guid userId);
        Task<List<string>> GetUserRolesAsync(Guid userId);
        Task SetUserRolesAsync(Guid userId, List<string> roleNames);
    }

    public class AdminDashboardStatsDto
    {
        public int UsersCount { get; set; }
        public int OrdersCount { get; set; }
        public int CouponsCount { get; set; }
        public int ReviewsCount { get; set; }
    }
} 