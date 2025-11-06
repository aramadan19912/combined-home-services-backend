using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using HomeServicesApp.ChatMessages;

namespace HomeServicesApp.Controllers
{
    [Area("app")]
    [RemoteService(Name = "app")]
    [Route("api/chat")]
    public class ChatMessageController : HomeServicesAppController
    {
        private readonly IChatMessageAppService _chatMessageAppService;

        public ChatMessageController(IChatMessageAppService chatMessageAppService)
        {
            _chatMessageAppService = chatMessageAppService;
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ChatMessageDto> GetAsync(Guid id)
        {
            return await _chatMessageAppService.GetAsync(id);
        }

        [HttpGet]
        [Route("order/{orderId}")]
        public async Task<PagedResultDto<ChatMessageDto>> GetByOrderIdAsync(
            Guid orderId,
            [FromQuery] PagedAndSortedResultRequestDto input)
        {
            return await _chatMessageAppService.GetByOrderIdAsync(orderId, input);
        }

        [HttpPost]
        [Route("")]
        public async Task<ChatMessageDto> CreateAsync([FromBody] CreateChatMessageDto input)
        {
            return await _chatMessageAppService.CreateAsync(input);
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task DeleteAsync(Guid id)
        {
            await _chatMessageAppService.DeleteAsync(id);
        }

        [HttpPost]
        [Route("{id}/mark-read")]
        public async Task<ChatMessageDto> MarkAsReadAsync(Guid id)
        {
            return await _chatMessageAppService.MarkAsReadAsync(id);
        }

        [HttpPost]
        [Route("{id}/mark-delivered")]
        public async Task<ChatMessageDto> MarkAsDeliveredAsync(Guid id)
        {
            return await _chatMessageAppService.MarkAsDeliveredAsync(id);
        }
    }
}
