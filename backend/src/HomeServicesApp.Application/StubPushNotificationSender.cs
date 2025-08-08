using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace HomeServicesApp
{
    public class StubPushNotificationSender : IPushNotificationSender
    {
        private readonly string _fcmServerKey;
        private static readonly HttpClient _httpClient = new HttpClient();

        public StubPushNotificationSender(IConfiguration configuration)
        {
            // Reads the FCM server key from configuration: Notification:FCM:ServerKey
            _fcmServerKey = configuration["Notification:FCM:ServerKey"];
            if (string.IsNullOrWhiteSpace(_fcmServerKey))
                throw new InvalidOperationException("FCM server key is not configured.");
        }

        public async Task SendPushAsync(string to, string title, string body)
        {
            var payload = new
            {
                to = to, // FCM device token
                notification = new
                {
                    title = title,
                    body = body
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, "https://fcm.googleapis.com/fcm/send")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.TryAddWithoutValidation("Authorization", $"key={_fcmServerKey}");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"FCM push notification failed: {response.StatusCode} - {error}");
            }
        }
    }
} 