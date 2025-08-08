using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using HomeServicesApp.Users;

namespace HomeServicesApp.Controllers
{
    [Route("api/user/profile")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileAppService _userProfileAppService;
        public UserProfileController(IUserProfileAppService userProfileAppService)
        {
            _userProfileAppService = userProfileAppService;
        }

        [HttpPost("fcm-token")]
        public async Task<IActionResult> SaveFcmToken([FromBody] string fcmToken)
        {
            await _userProfileAppService.SaveFcmTokenAsync(fcmToken);
            return Ok();
        }

        [HttpGet("fcm-token")]
        public async Task<IActionResult> GetFcmToken()
        {
            var token = await _userProfileAppService.GetFcmTokenAsync();
            return Ok(new { fcmToken = token });
        }
    }
} 