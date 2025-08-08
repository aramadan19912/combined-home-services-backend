using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using HomeServicesApp.Providers;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Linq;

namespace HomeServicesApp.Controllers
{
    [Route("api/provider")]
    [ApiController]
    [Authorize]
    public class ProviderController : ControllerBase
    {
        private readonly IRepository<Provider, Guid> _providerRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IFileStorageService _fileStorageService;
        private readonly IProviderAppService _providerAppService;

        public ProviderController(IRepository<Provider, Guid> providerRepository, ICurrentUser currentUser, IFileStorageService fileStorageService, IProviderAppService providerAppService)
        {
            _providerRepository = providerRepository;
            _currentUser = currentUser;
            _fileStorageService = fileStorageService;
            _providerAppService = providerAppService;
        }

        [HttpPost("upload-id")]
        public async Task<IActionResult> UploadId(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == _currentUser.GetId());
            if (provider == null) return NotFound("Provider not found");
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileName = $"id_{provider.Id}_{Path.GetFileName(file.FileName)}";
            var filePath = await _fileStorageService.SaveFileAsync(ms.ToArray(), fileName, "provider-ids");
            provider.IdAttachmentPath = filePath;
            await _providerRepository.UpdateAsync(provider);
            return Ok(new { path = filePath });
        }

        [HttpPost("upload-cr")]
        public async Task<IActionResult> UploadCR(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");
            var provider = await _providerRepository.FirstOrDefaultAsync(x => x.UserId == _currentUser.GetId());
            if (provider == null) return NotFound("Provider not found");
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileName = $"cr_{provider.Id}_{Path.GetFileName(file.FileName)}";
            var filePath = await _fileStorageService.SaveFileAsync(ms.ToArray(), fileName, "provider-crs");
            provider.CRAttachmentPath = filePath;
            await _providerRepository.UpdateAsync(provider);
            return Ok(new { path = filePath });
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<List<ProviderDto>> GetAllProviders()
        {
            return await _providerAppService.GetAllAsync();
        }

        [HttpGet("admin/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ProviderDto> GetProviderById(Guid id)
        {
            return await _providerAppService.GetByIdAsync(id);
        }

        [HttpPost("admin/approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveProvider(Guid id)
        {
            await _providerAppService.ApproveAsync(id);
            return Ok();
        }

        [HttpPost("admin/reject/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectProvider(Guid id)
        {
            await _providerAppService.RejectAsync(id);
            return Ok();
        }

        [HttpGet("admin/download-id/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DownloadProviderId(Guid id)
        {
            var provider = await _providerRepository.GetAsync(id);
            if (string.IsNullOrEmpty(provider.IdAttachmentPath) || !System.IO.File.Exists(provider.IdAttachmentPath))
                return NotFound("ID attachment not found");
            var bytes = await _fileStorageService.GetFileAsync(provider.IdAttachmentPath);
            var fileName = Path.GetFileName(provider.IdAttachmentPath);
            return File(bytes, "application/octet-stream", fileName);
        }

        [HttpGet("admin/download-cr/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DownloadProviderCR(Guid id)
        {
            var provider = await _providerRepository.GetAsync(id);
            if (string.IsNullOrEmpty(provider.CRAttachmentPath) || !System.IO.File.Exists(provider.CRAttachmentPath))
                return NotFound("CR attachment not found");
            var bytes = await _fileStorageService.GetFileAsync(provider.CRAttachmentPath);
            var fileName = Path.GetFileName(provider.CRAttachmentPath);
            return File(bytes, "application/octet-stream", fileName);
        }

        [HttpGet("status")] // GET /api/provider/status
        public async Task<IActionResult> GetMyStatus()
        {
            var status = await _providerAppService.GetMyApprovalStatusAsync();
            return Ok(new { status });
        }

        [HttpGet("admin/notifications")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetNotificationHistory()
        {
            return Ok(_providerAppService.GetNotificationHistory());
        }

        [HttpGet("admin/search")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SearchProviders([FromQuery] string status = null)
        {
            var all = await _providerAppService.GetAllAsync();
            if (!string.IsNullOrEmpty(status))
                all = all.Where(p => p.ApprovalStatus == status).ToList();
            return Ok(all);
        }

        [HttpPost("admin/bulk-approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BulkApprove([FromBody] List<Guid> ids)
        {
            foreach (var id in ids)
            {
                await _providerAppService.ApproveAsync(id);
            }
            return Ok(new { success = true, approved = ids.Count });
        }

        [HttpPost("admin/bulk-reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BulkReject([FromBody] BulkRejectDto dto)
        {
            foreach (var id in dto.Ids)
            {
                await _providerAppService.RejectAsync(id, dto.Reason);
            }
            return Ok(new { success = true, rejected = dto.Ids.Count });
        }

        [HttpGet("admin/audit-log")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAuditLog()
        {
            var auditLogs = _providerAppService.GetNotificationHistory()
                .Select(log => new { 
                    Action = log.Contains("Approved") ? "Approved" : "Rejected",
                    Timestamp = DateTime.UtcNow,
                    Details = log 
                })
                .ToList();
            
            return Ok(auditLogs);
        }

        public class BulkRejectDto
        {
            public List<Guid> Ids { get; set; }
            public string Reason { get; set; }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> PublicSearch([FromQuery] string query = null, [FromQuery] string category = null)
        {
            var all = await _providerAppService.GetAllAsync();
            var filtered = all.Where(p =>
                (string.IsNullOrEmpty(query) || (p.Bio != null && p.Bio.Contains(query, StringComparison.OrdinalIgnoreCase))) &&
                (string.IsNullOrEmpty(category) || (p.Specialization != null && p.Specialization.Equals(category, StringComparison.OrdinalIgnoreCase)))
            ).ToList();
            return Ok(filtered);
        }
    }
}    