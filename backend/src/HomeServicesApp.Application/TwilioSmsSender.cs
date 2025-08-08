using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace HomeServicesApp
{
    public class TwilioSmsSender : ISmsSender
    {
        private readonly IConfiguration _configuration;
        public TwilioSmsSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public Task SendSmsAsync(string to, string message)
        {
            var sid = _configuration["Twilio:AccountSid"];
            var token = _configuration["Twilio:AuthToken"];
            var from = _configuration["Twilio:From"];
            TwilioClient.Init(sid, token);
            return MessageResource.CreateAsync(
                to: to,
                from: new Twilio.Types.PhoneNumber(from),
                body: message
            );
        }
    }
} 