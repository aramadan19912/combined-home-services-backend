using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.Payments;
using System.Linq;

namespace HomeServicesApp.Payments
{
    public class UserPaymentMethodAppService : ApplicationService
    {
        private readonly IRepository<UserPaymentMethod, Guid> _repository;

        public UserPaymentMethodAppService(IRepository<UserPaymentMethod, Guid> repository)
        {
            _repository = repository;
        }

        public async Task<List<UserPaymentMethodDto>> GetListAsync()
        {
            var userId = CurrentUser.Id;
            var methods = await _repository.GetListAsync(x => x.UserId == userId);
            return methods.Select(x => new UserPaymentMethodDto
            {
                Id = x.Id,
                MethodType = x.MethodType,
                MaskedDetails = x.MaskedDetails,
                Provider = x.Provider,
                AddedAt = x.AddedAt
            }).ToList();
        }

        public async Task<UserPaymentMethodDto> CreateAsync(CreateUpdateUserPaymentMethodDto dto)
        {
            var userId = CurrentUser.Id;
            var entity = new UserPaymentMethod
            {
                UserId = userId.Value,
                MethodType = dto.MethodType,
                MaskedDetails = dto.MaskedDetails,
                Provider = dto.Provider,
                AddedAt = DateTime.UtcNow
            };
            await _repository.InsertAsync(entity);
            return new UserPaymentMethodDto
            {
                Id = entity.Id,
                MethodType = entity.MethodType,
                MaskedDetails = entity.MaskedDetails,
                Provider = entity.Provider,
                AddedAt = entity.AddedAt
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var userId = CurrentUser.Id;
            var entity = await _repository.GetAsync(x => x.Id == id && x.UserId == userId);
            if (entity != null)
            {
                await _repository.DeleteAsync(entity);
            }
        }
    }
} 