using System.Threading.Tasks;

namespace HomeServicesApp.Payments
{
    public class FawryPaymentProvider : IPaymentProvider
    {
        public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
        {
            // منطق الاتصال الفعلي بـ Fawry هنا
            // مؤقتًا: محاكاة نجاح العملية
            return await Task.FromResult(new PaymentResult
            {
                Success = true,
                TransactionId = System.Guid.NewGuid().ToString(),
                ErrorMessage = null
            });
        }
    }
} 