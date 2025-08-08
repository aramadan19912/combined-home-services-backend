using System.Threading.Tasks;

namespace HomeServicesApp
{
    public interface ISmsSender
    {
        Task SendSmsAsync(string to, string message);
    }
} 