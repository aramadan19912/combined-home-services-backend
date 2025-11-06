using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace HomeServicesApp.ServiceImages
{
    public class ServiceImageAppService : CrudAppService<
        ServiceImage,
        ServiceImageDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateServiceImageDto,
        CreateUpdateServiceImageDto
    >, IServiceImageAppService
    {
        private readonly IRepository<ServiceImage, Guid> _imageRepository;

        public ServiceImageAppService(IRepository<ServiceImage, Guid> repository)
            : base(repository)
        {
            _imageRepository = repository;
        }

        public override async Task<ServiceImageDto> CreateAsync(CreateUpdateServiceImageDto input)
        {
            // If this image is set as primary, unset any existing primary image for this service
            if (input.IsPrimary)
            {
                var existingPrimary = await _imageRepository.FirstOrDefaultAsync(
                    x => x.ServiceId == input.ServiceId && x.IsPrimary
                );

                if (existingPrimary != null)
                {
                    existingPrimary.IsPrimary = false;
                    await _imageRepository.UpdateAsync(existingPrimary, autoSave: false);
                }
            }

            return await base.CreateAsync(input);
        }

        public override async Task<ServiceImageDto> UpdateAsync(Guid id, CreateUpdateServiceImageDto input)
        {
            // If this image is being set as primary, unset any existing primary image for this service
            if (input.IsPrimary)
            {
                var existingPrimary = await _imageRepository.FirstOrDefaultAsync(
                    x => x.ServiceId == input.ServiceId && x.IsPrimary && x.Id != id
                );

                if (existingPrimary != null)
                {
                    existingPrimary.IsPrimary = false;
                    await _imageRepository.UpdateAsync(existingPrimary, autoSave: false);
                }
            }

            return await base.UpdateAsync(id, input);
        }

        public async Task<List<ServiceImageDto>> GetByServiceIdAsync(Guid serviceId)
        {
            var query = await _imageRepository.GetQueryableAsync();

            var images = await AsyncExecuter.ToListAsync(
                query.Where(x => x.ServiceId == serviceId)
                    .OrderByDescending(x => x.IsPrimary)
                    .ThenBy(x => x.DisplayOrder)
            );

            return ObjectMapper.Map<List<ServiceImage>, List<ServiceImageDto>>(images);
        }

        public async Task<ServiceImageDto> GetPrimaryImageAsync(Guid serviceId)
        {
            var image = await _imageRepository.FirstOrDefaultAsync(
                x => x.ServiceId == serviceId && x.IsPrimary
            );

            if (image == null)
            {
                // If no primary image, get the first image by display order
                image = await _imageRepository.FirstOrDefaultAsync(
                    x => x.ServiceId == serviceId
                );
            }

            return ObjectMapper.Map<ServiceImage, ServiceImageDto>(image);
        }

        public async Task<ServiceImageDto> SetPrimaryAsync(Guid id)
        {
            var image = await _imageRepository.GetAsync(id);

            // Unset any existing primary image for this service
            var existingPrimary = await _imageRepository.FirstOrDefaultAsync(
                x => x.ServiceId == image.ServiceId && x.IsPrimary && x.Id != id
            );

            if (existingPrimary != null)
            {
                existingPrimary.IsPrimary = false;
                await _imageRepository.UpdateAsync(existingPrimary, autoSave: false);
            }

            image.IsPrimary = true;
            await _imageRepository.UpdateAsync(image, autoSave: true);

            return ObjectMapper.Map<ServiceImage, ServiceImageDto>(image);
        }

        public async Task ReorderImagesAsync(Guid serviceId, List<Guid> imageIds)
        {
            var images = await _imageRepository.GetListAsync(x => x.ServiceId == serviceId);

            for (int i = 0; i < imageIds.Count; i++)
            {
                var image = images.FirstOrDefault(x => x.Id == imageIds[i]);
                if (image != null)
                {
                    image.DisplayOrder = i;
                }
            }

            await _imageRepository.UpdateManyAsync(images, autoSave: true);
        }

        public async Task DeleteByServiceIdAsync(Guid serviceId)
        {
            var images = await _imageRepository.GetListAsync(x => x.ServiceId == serviceId);
            await _imageRepository.DeleteManyAsync(images, autoSave: true);
        }
    }
}
