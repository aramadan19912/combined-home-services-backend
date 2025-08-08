using System.Threading.Tasks;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using System.IO;

namespace HomeServicesApp.Notifications
{
    public class FirebasePushNotificationService
    {
        private static bool _initialized = false;
        public FirebasePushNotificationService()
        {
            if (!_initialized)
            {
                var path = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "secrets", "firebase-service-account.json");
                if (FirebaseApp.DefaultInstance == null)
                {
                    FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.FromFile(path)
                    });
                }
                _initialized = true;
            }
        }

        public async Task<string> SendNotificationAsync(string fcmToken, string title, string body)
        {
            var message = new Message()
            {
                Token = fcmToken,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                }
            };
            var messaging = FirebaseMessaging.DefaultInstance;
            return await messaging.SendAsync(message);
        }
    }
}  