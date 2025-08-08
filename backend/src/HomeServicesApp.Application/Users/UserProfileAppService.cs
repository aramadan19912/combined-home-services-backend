using System;
using System.Threading.Tasks;
using HomeServicesApp.Users;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;
using Volo.Abp.Users;

namespace HomeServicesApp.Users
{
    [Authorize]
    public class UserProfileAppService : ApplicationService, IUserProfileAppService
    {
        private readonly IIdentityUserRepository _userRepository;
        private readonly ICurrentUser _currentUser;

        public UserProfileAppService(IIdentityUserRepository userRepository, ICurrentUser currentUser)
        {
            _userRepository = userRepository;
            _currentUser = currentUser;
        }

        public async Task<UserProfileDto> GetAsync()
        {
            var user = await _userRepository.GetAsync(_currentUser.GetId());
            string address = null, profileImage = null, userType = null;
            bool isVerified = false;
            if (user.ExtraProperties != null)
            {
                if (user.ExtraProperties.TryGetValue("Address", out var addrObj))
                    address = addrObj?.ToString();
                if (user.ExtraProperties.TryGetValue("ProfileImage", out var imgObj))
                    profileImage = imgObj?.ToString();
                if (user.ExtraProperties.TryGetValue("UserType", out var typeObj))
                    userType = typeObj?.ToString();
                if (user.ExtraProperties.TryGetValue("IsVerified", out var verObj))
                    isVerified = verObj is bool b && b;
            }
            return new UserProfileDto
            {
                Id = user.Id,
                FullName = user.Name,
                Email = user.Email,
                Address = address,
                PhoneNumber = user.PhoneNumber,
                ProfileImage = profileImage,
                UserType = userType,
                IsVerified = isVerified
            };
        }

        public async Task<UserProfileDto> UpdateAsync(UpdateUserProfileDto input)
        {
            var user = await _userRepository.GetAsync(_currentUser.GetId());
            user.Name = input.FullName;
            // لا يمكن تعيين PhoneNumber مباشرة إذا كان set محميًا
            if (user.ExtraProperties != null)
            {
                user.ExtraProperties["Address"] = input.Address;
                user.ExtraProperties["ProfileImage"] = input.ProfileImage;
            }
            await _userRepository.UpdateAsync(user);
            return await GetAsync();
        }

        public async Task SaveFcmTokenAsync(string fcmToken)
        {
            var user = await _userRepository.GetAsync(_currentUser.GetId());
            if (user.ExtraProperties != null)
            {
                user.ExtraProperties["FcmToken"] = fcmToken;
                await _userRepository.UpdateAsync(user);
            }
        }

        public async Task<string> GetFcmTokenAsync()
        {
            var user = await _userRepository.GetAsync(_currentUser.GetId());
            if (user.ExtraProperties != null && user.ExtraProperties.TryGetValue("FcmToken", out var tokenObj))
            {
                return tokenObj?.ToString();
            }
            return null;
        }
    }

    public interface IUserProfileAppService
    {
        Task<UserProfileDto> GetAsync();
        Task<UserProfileDto> UpdateAsync(UpdateUserProfileDto input);
        Task SaveFcmTokenAsync(string fcmToken);
        Task<string> GetFcmTokenAsync();
    }
} 