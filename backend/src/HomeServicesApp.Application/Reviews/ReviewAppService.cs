using System;
using System.Threading.Tasks;
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

        public async Task<ReviewDto> MarkHelpfulAsync(Guid id)
        {
            var review = await Repository.GetAsync(id);
            review.HelpfulCount++;
            await Repository.UpdateAsync(review, autoSave: true);
            return ObjectMapper.Map<Review, ReviewDto>(review);
        }

        public async Task<ReviewDto> MarkNotHelpfulAsync(Guid id)
        {
            var review = await Repository.GetAsync(id);
            review.NotHelpfulCount++;
            await Repository.UpdateAsync(review, autoSave: true);
            return ObjectMapper.Map<Review, ReviewDto>(review);
        }

        public async Task<ReviewDto> AddProviderResponseAsync(Guid id, string response)
        {
            var review = await Repository.GetAsync(id);
            review.ProviderResponse = response;
            review.ProviderResponseDate = DateTime.UtcNow;
            await Repository.UpdateAsync(review, autoSave: true);
            return ObjectMapper.Map<Review, ReviewDto>(review);
        }

        public async Task<ReviewDto> ModerateAsync(Guid id, ReviewStatus status, string notes)
        {
            var review = await Repository.GetAsync(id);
            review.Status = (HomeServicesApp.ReviewStatus)status;
            review.ModerationNotes = notes;
            await Repository.UpdateAsync(review, autoSave: true);
            return ObjectMapper.Map<Review, ReviewDto>(review);
        }

        public async Task ReportAsync(Guid id, string reason)
        {
            var review = await Repository.GetAsync(id);
            review.Status = HomeServicesApp.ReviewStatus.Flagged;
            review.ModerationNotes = $"Reported: {reason}";
            await Repository.UpdateAsync(review, autoSave: true);
        }
    }

    public interface IReviewAppService : ICrudAppService<
        ReviewDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateReviewDto,
        CreateUpdateReviewDto>
    {
        Task<ReviewDto> MarkHelpfulAsync(Guid id);
        Task<ReviewDto> MarkNotHelpfulAsync(Guid id);
        Task<ReviewDto> AddProviderResponseAsync(Guid id, string response);
        Task<ReviewDto> ModerateAsync(Guid id, ReviewStatus status, string notes);
        Task ReportAsync(Guid id, string reason);
    }
} 