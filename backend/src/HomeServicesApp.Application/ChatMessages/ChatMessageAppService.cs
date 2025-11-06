using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace HomeServicesApp.ChatMessages
{
    public class ChatMessageAppService : ApplicationService, IChatMessageAppService
    {
        private readonly IRepository<ChatMessage, Guid> _chatMessageRepository;

        public ChatMessageAppService(IRepository<ChatMessage, Guid> chatMessageRepository)
        {
            _chatMessageRepository = chatMessageRepository;
        }

        public async Task<ChatMessageDto> GetAsync(Guid id)
        {
            var message = await _chatMessageRepository.GetAsync(id);
            return ObjectMapper.Map<ChatMessage, ChatMessageDto>(message);
        }

        public async Task<PagedResultDto<ChatMessageDto>> GetByOrderIdAsync(
            Guid orderId,
            PagedAndSortedResultRequestDto input)
        {
            var query = await _chatMessageRepository.GetQueryableAsync();
            query = query.Where(x => x.OrderId == orderId);

            var totalCount = await AsyncExecuter.CountAsync(query);

            var items = await AsyncExecuter.ToListAsync(
                query.OrderBy(x => x.CreatedAt)
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
            );

            return new PagedResultDto<ChatMessageDto>(
                totalCount,
                ObjectMapper.Map<System.Collections.Generic.List<ChatMessage>, System.Collections.Generic.List<ChatMessageDto>>(items)
            );
        }

        public async Task<ChatMessageDto> CreateAsync(CreateChatMessageDto input)
        {
            var message = new ChatMessage
            {
                OrderId = input.OrderId,
                SenderId = input.SenderId,
                ReceiverId = input.ReceiverId,
                MessageType = input.MessageType,
                Message = input.Message,
                AttachmentUrl = input.AttachmentUrl,
                Latitude = input.Latitude,
                Longitude = input.Longitude,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _chatMessageRepository.InsertAsync(message, autoSave: true);
            return ObjectMapper.Map<ChatMessage, ChatMessageDto>(created);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _chatMessageRepository.DeleteAsync(id);
        }

        public async Task<ChatMessageDto> MarkAsReadAsync(Guid id)
        {
            var message = await _chatMessageRepository.GetAsync(id);
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            await _chatMessageRepository.UpdateAsync(message, autoSave: true);
            return ObjectMapper.Map<ChatMessage, ChatMessageDto>(message);
        }

        public async Task<ChatMessageDto> MarkAsDeliveredAsync(Guid id)
        {
            var message = await _chatMessageRepository.GetAsync(id);
            message.DeliveredAt = DateTime.UtcNow;
            await _chatMessageRepository.UpdateAsync(message, autoSave: true);
            return ObjectMapper.Map<ChatMessage, ChatMessageDto>(message);
        }
    }
}
