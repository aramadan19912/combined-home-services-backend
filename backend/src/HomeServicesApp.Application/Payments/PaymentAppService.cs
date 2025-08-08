using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.Providers;
using HomeServicesApp.Orders;
using System.Linq;
using System.Collections.Generic;
using HomeServicesApp.Payments;
using HomeServicesApp.Notifications;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;

namespace HomeServicesApp.Payments
{
    public class PaymentAppService : ApplicationService
    {
        private readonly IRepository<Order, Guid> _orderRepository;
        private readonly IRepository<PaymentTransaction, Guid> _paymentTransactionRepository;
        private readonly ApplePayPaymentProvider _applePayProvider;
        private readonly AlRajhiPaymentProvider _alRajhiProvider;
        private readonly FawryPaymentProvider _fawryProvider;
        private readonly NBEgyptPaymentProvider _nbEgyptProvider;
        private readonly IRepository<NotificationLog, Guid> _notificationLogRepository;
        // يمكن إضافة حقن مزودي الدفع هنا لاحقًا

        public PaymentAppService(
            IRepository<Order, Guid> orderRepository,
            IRepository<PaymentTransaction, Guid> paymentTransactionRepository,
            ApplePayPaymentProvider applePayProvider,
            AlRajhiPaymentProvider alRajhiProvider,
            FawryPaymentProvider fawryProvider,
            NBEgyptPaymentProvider nbEgyptProvider,
            IRepository<NotificationLog, Guid> notificationLogRepository
        )
        {
            _orderRepository = orderRepository;
            _paymentTransactionRepository = paymentTransactionRepository;
            _applePayProvider = applePayProvider;
            _alRajhiProvider = alRajhiProvider;
            _fawryProvider = fawryProvider;
            _nbEgyptProvider = nbEgyptProvider;
            _notificationLogRepository = notificationLogRepository;
        }

        public async Task<bool> PayAsync(Guid orderId, decimal amount, PaymentProviderType providerType)
        {
            var order = await _orderRepository.GetAsync(orderId);
            if (order.IsFullyPaid)
                throw new Exception("Order is already fully paid.");
            if (amount <= 0 || amount > order.RemainingAmount)
                throw new Exception("Invalid payment amount.");

            // اختيار مزود الدفع المناسب
            IPaymentProvider provider = providerType switch
            {
                PaymentProviderType.ApplePay => _applePayProvider,
                PaymentProviderType.AlRajhi => _alRajhiProvider,
                PaymentProviderType.Fawry => _fawryProvider,
                PaymentProviderType.NBEgypt => _nbEgyptProvider,
                _ => throw new Exception("Unsupported payment provider.")
            };

            var paymentResult = await provider.ProcessPaymentAsync(new PaymentRequest
            {
                OrderId = orderId,
                Amount = amount,
                ProviderType = providerType
            });

            // سجل العملية
            var transaction = new PaymentTransaction
            {
                OrderId = orderId,
                Amount = amount,
                PaymentMethod = providerType.ToString(),
                TransactionStatus = paymentResult.Success ? "Success" : "Failed",
                ProviderTransactionId = paymentResult.TransactionId,
                TransactionDate = DateTime.UtcNow,
                Notes = paymentResult.ErrorMessage
            };
            await _paymentTransactionRepository.InsertAsync(transaction);

            if (paymentResult.Success)
            {
                order.PaidAmount += amount;
                order.RemainingAmount = order.TotalPrice - order.PaidAmount;
                if (order.RemainingAmount <= 0)
                {
                    order.IsFullyPaid = true;
                    order.PaymentStatus = PaymentStatus.Paid;
                }
                await _orderRepository.UpdateAsync(order);
                // إشعار الدفع
                await _notificationLogRepository.InsertAsync(new NotificationLog
                {
                    UserId = order.UserId,
                    Type = "Payment",
                    Data = $"تم دفع مبلغ {amount} للطلب رقم {order.Id} عبر {providerType}",
                    IsRead = false
                });
            }
            return paymentResult.Success;
        }

        public async Task<List<PaymentTransactionDto>> GetTransactionsByOrderAsync(Guid orderId)
        {
            var transactions = await _paymentTransactionRepository.GetListAsync(x => x.OrderId == orderId);
            return transactions.Select(t => new PaymentTransactionDto
            {
                Id = t.Id,
                OrderId = t.OrderId,
                Amount = t.Amount,
                PaymentMethod = t.PaymentMethod,
                TransactionStatus = t.TransactionStatus,
                ProviderTransactionId = t.ProviderTransactionId,
                TransactionDate = t.TransactionDate,
                Notes = t.Notes
            }).ToList();
        }

        public async Task<List<PaymentTransactionDto>> GetAllTransactionsAsync()
        {
            var transactions = await _paymentTransactionRepository.GetListAsync();
            return transactions.Select(t => new PaymentTransactionDto
            {
                Id = t.Id,
                OrderId = t.OrderId,
                Amount = t.Amount,
                PaymentMethod = t.PaymentMethod,
                TransactionStatus = t.TransactionStatus,
                ProviderTransactionId = t.ProviderTransactionId,
                TransactionDate = t.TransactionDate,
                Notes = t.Notes
            }).ToList();
        }

        public async Task<OrderPaymentStatusDto> GetOrderPaymentStatusAsync(Guid orderId)
        {
            var order = await _orderRepository.GetAsync(orderId);
            return new OrderPaymentStatusDto
            {
                OrderId = order.Id,
                PaidAmount = order.PaidAmount,
                RemainingAmount = order.RemainingAmount,
                IsFullyPaid = order.IsFullyPaid,
                PaymentStatus = order.PaymentStatus
            };
        }

        public async Task<bool> RefundTransactionAsync(Guid transactionId)
        {
            var transaction = await _paymentTransactionRepository.GetAsync(transactionId);
            if (transaction.TransactionStatus == "Refunded")
                return false;
            transaction.TransactionStatus = "Refunded";
            transaction.Notes = "Refunded by user/admin at " + DateTime.UtcNow;
            await _paymentTransactionRepository.UpdateAsync(transaction);

            // تحديث الطلب بإرجاع المبلغ
            var order = await _orderRepository.GetAsync(transaction.OrderId);
            order.PaidAmount -= transaction.Amount;
            order.RemainingAmount += transaction.Amount;
            order.IsFullyPaid = order.PaidAmount >= order.TotalPrice ? true : false;
            order.PaymentStatus = order.IsFullyPaid ? PaymentStatus.Paid : PaymentStatus.Unpaid;
            await _orderRepository.UpdateAsync(order);
            // إشعار الاسترداد
            await _notificationLogRepository.InsertAsync(new NotificationLog
            {
                UserId = order.UserId,
                Type = "Refund",
                Data = $"تم استرداد مبلغ {transaction.Amount} من الطلب رقم {order.Id}",
                IsRead = false
            });
            return true;
        }

        public async Task<bool> RetryPaymentAsync(Guid transactionId)
        {
            var transaction = await _paymentTransactionRepository.GetAsync(transactionId);
            if (transaction == null || transaction.TransactionStatus == "Success")
                return false;

            if (!Enum.TryParse<PaymentProviderType>(transaction.PaymentMethod, out var providerType))
                return false;

            // إعادة محاولة الدفع باستخدام نفس البيانات
            return await PayAsync(transaction.OrderId, transaction.Amount, providerType);
        }

        public async Task<byte[]> GenerateReceiptPdfAsync(Guid transactionId)
        {
            var transaction = await _paymentTransactionRepository.GetAsync(transactionId);
            if (transaction == null)
                return null;
            var order = await _orderRepository.GetAsync(transaction.OrderId);
            if (order == null)
                return null;

            using (var document = new PdfDocument())
            {
                var page = document.AddPage();
                var gfx = XGraphics.FromPdfPage(page);
                var font = new XFont("Arial", 14, XFontStyle.Regular);
                int y = 40;
                gfx.DrawString("إيصال الدفع", new XFont("Arial", 18, XFontStyle.Bold), XBrushes.Black, new XRect(0, y, page.Width, 30), XStringFormats.TopCenter);
                y += 40;
                gfx.DrawString($"رقم العملية: {transaction.Id}", font, XBrushes.Black, 40, y);
                y += 30;
                gfx.DrawString($"تاريخ العملية: {transaction.TransactionDate:yyyy-MM-dd HH:mm}", font, XBrushes.Black, 40, y);
                y += 30;
                gfx.DrawString($"المبلغ: {transaction.Amount} ريال", font, XBrushes.Black, 40, y);
                y += 30;
                gfx.DrawString($"طريقة الدفع: {transaction.PaymentMethod}", font, XBrushes.Black, 40, y);
                y += 30;
                gfx.DrawString($"حالة العملية: {transaction.TransactionStatus}", font, XBrushes.Black, 40, y);
                y += 30;
                gfx.DrawString($"رقم الطلب: {order.Id}", font, XBrushes.Black, 40, y);
                y += 30;
                gfx.DrawString($"إجمالي الطلب: {order.TotalPrice} ريال", font, XBrushes.Black, 40, y);
                y += 30;
                gfx.DrawString($"المدفوع: {order.PaidAmount} ريال", font, XBrushes.Black, 40, y);
                y += 30;
                gfx.DrawString($"المتبقي: {order.RemainingAmount} ريال", font, XBrushes.Black, 40, y);
                y += 30;
                if (!string.IsNullOrEmpty(transaction.Notes))
                {
                    gfx.DrawString($"ملاحظات: {transaction.Notes}", font, XBrushes.Black, 40, y);
                }
                using (var stream = new System.IO.MemoryStream())
                {
                    document.Save(stream, false);
                    return stream.ToArray();
                }
            }
        }

        public async Task<bool> RefundPartialTransactionAsync(Guid transactionId, decimal amount)
        {
            var transaction = await _paymentTransactionRepository.GetAsync(transactionId);
            if (transaction == null || transaction.TransactionStatus == "Refunded" || amount <= 0 || amount > transaction.Amount)
                return false;

            transaction.Amount -= amount;
            transaction.Notes = $"Partial refund of {amount} at {DateTime.UtcNow}";
            await _paymentTransactionRepository.UpdateAsync(transaction);

            var order = await _orderRepository.GetAsync(transaction.OrderId);
            order.PaidAmount -= amount;
            order.RemainingAmount += amount;
            order.IsFullyPaid = order.PaidAmount >= order.TotalPrice ? true : false;
            order.PaymentStatus = order.IsFullyPaid ? PaymentStatus.Paid : PaymentStatus.Unpaid;
            await _orderRepository.UpdateAsync(order);

            // إشعار الاسترداد الجزئي
            await _notificationLogRepository.InsertAsync(new NotificationLog
            {
                UserId = order.UserId,
                Type = "PartialRefund",
                Data = $"تم استرداد جزء من المبلغ ({amount}) من الطلب رقم {order.Id}",
                IsRead = false
            });

            return true;
        }
    }
} 