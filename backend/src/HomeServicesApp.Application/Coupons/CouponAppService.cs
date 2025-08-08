using System;
using System.Threading.Tasks;
using HomeServicesApp.Coupons;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace HomeServicesApp.Coupons
{
    [Authorize("Admin")] // صلاحية الأدمن فقط
    public class CouponAppService : CrudAppService<
        Coupon,
        CouponDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateCouponDto,
        CreateUpdateCouponDto>, ICouponAppService
    {
        public CouponAppService(IRepository<Coupon, Guid> repository)
            : base(repository)
        {
        }

        [AllowAnonymous] // يمكن للمستخدمين تجربة الكوبون
        public async Task<CouponDto> ApplyCouponAsync(string code)
        {
            var coupon = await Repository.FirstOrDefaultAsync(x => x.Code == code && x.IsActive && x.ExpiryDate > DateTime.Now);
            if (coupon == null || coupon.UsageCount >= coupon.MaxUsage)
                throw new Volo.Abp.UserFriendlyException("Coupon is invalid or expired.");

            // زيادة عدد مرات الاستخدام
            coupon.UsageCount++;
            await Repository.UpdateAsync(coupon);
            return ObjectMapper.Map<Coupon, CouponDto>(coupon);
        }
    }

    public interface ICouponAppService : ICrudAppService<
        CouponDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateCouponDto,
        CreateUpdateCouponDto>
    {
        Task<CouponDto> ApplyCouponAsync(string code);
    }
} 