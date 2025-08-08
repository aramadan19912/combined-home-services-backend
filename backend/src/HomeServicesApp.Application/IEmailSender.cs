using System.Threading.Tasks;

namespace HomeServicesApp
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
} 