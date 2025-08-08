using System.Threading.Tasks;

namespace HomeServicesApp.Payments
{
    public class AlRajhiPaymentProvider : IPaymentProvider
    {
        public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
        {
            // منطق الاتصال الفعلي بـ Al Rajhi هنا
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