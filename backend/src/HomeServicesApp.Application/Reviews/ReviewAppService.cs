using System;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.Reviews;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Reviews
{
    public class ReviewAppService : CrudAppService<
        Review, // The Entity
        ReviewDto, // DTO to return
        Guid, // Primary Key
        PagedAndSortedResultRequestDto, // Paging
        CreateUpdateReviewDto, // Create
        CreateUpdateReviewDto // Update
    >, IReviewAppService
    {
        public ReviewAppService(IRepository<Review, Guid> repository)
            : base(repository)
        {
        }
    }

    public interface IReviewAppService : ICrudAppService<
        ReviewDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateReviewDto,
        CreateUpdateReviewDto>
    { }
} 