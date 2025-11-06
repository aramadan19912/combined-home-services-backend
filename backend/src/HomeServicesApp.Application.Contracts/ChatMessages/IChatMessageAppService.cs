using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.ChatMessages
{
    public interface IChatMessageAppService : IApplicationService
    {
        Task<ChatMessageDto> GetAsync(Guid id);
        Task<PagedResultDto<ChatMessageDto>> GetByOrderIdAsync(Guid orderId, PagedAndSortedResultRequestDto input);
        Task<ChatMessageDto> CreateAsync(CreateChatMessageDto input);
        Task DeleteAsync(Guid id);
        Task<ChatMessageDto> MarkAsReadAsync(Guid id);
        Task<ChatMessageDto> MarkAsDeliveredAsync(Guid id);
    }
}
