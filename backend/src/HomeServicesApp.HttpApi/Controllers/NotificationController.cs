using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using HomeServicesApp.Notifications;
using HomeServicesApp.Users;

namespace HomeServicesApp.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly FirebasePushNotificationService _pushService;
        private readonly IUserProfileAppService _userProfileAppService;
        public NotificationController(FirebasePushNotificationService pushService, IUserProfileAppService userProfileAppService)
        {
            _pushService = pushService;
            _userProfileAppService = userProfileAppService;
        }

        // Test endpoint: send to any FCM token
        [HttpPost("test")]
        public async Task<IActionResult> SendTest([FromBody] TestNotificationDto dto)
        {
            var result = await _pushService.SendNotificationAsync(dto.FcmToken, dto.Title, dto.Body);
            return Ok(new { messageId = result });
        }

        // Real endpoint: send to current user's stored token
        [HttpPost("me")] 
        public async Task<IActionResult> SendToMe([FromBody] NotificationContentDto dto)
        {
            var fcmToken = await _userProfileAppService.GetFcmTokenAsync();
            if (string.IsNullOrEmpty(fcmToken)) return BadRequest("No FCM token found for user");
            var result = await _pushService.SendNotificationAsync(fcmToken, dto.Title, dto.Body);
            return Ok(new { messageId = result });
        }
    }

    public class TestNotificationDto
    {
        public string FcmToken { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
    }
    public class NotificationContentDto
    {
        public string Title { get; set; }
        public string Body { get; set; }
    }
} 