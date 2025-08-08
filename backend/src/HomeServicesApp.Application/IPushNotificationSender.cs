using System.Threading.Tasks;

namespace HomeServicesApp
{
    public interface IPushNotificationSender
    {
        Task SendPushAsync(string to, string title, string body);
    }
} 