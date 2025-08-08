using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using HomeServicesApp.Complaints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace HomeServicesApp.Controllers
{
    [Route("api/complaints")]
    [ApiController]
    public class ComplaintController : ControllerBase
    {
        private readonly IComplaintAppService _complaintAppService;
        private readonly IFileStorageService _fileStorageService;
        public ComplaintController(IComplaintAppService complaintAppService, IFileStorageService fileStorageService)
        {
            _complaintAppService = complaintAppService;
            _fileStorageService = fileStorageService;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ComplaintDto>> Create([FromBody] CreateComplaintDto input)
        {
            var result = await _complaintAppService.CreateAsync(input);
            return Ok(result);
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<List<ComplaintDto>>> GetMyComplaints()
        {
            var result = await _complaintAppService.GetMyComplaintsAsync();
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<ComplaintDto>>> GetAll()
        {
            var result = await _complaintAppService.GetAllAsync();
            return Ok(result);
        }

        [HttpPost("reply/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Reply(Guid id, [FromBody] AdminReplyDto input)
        {
            await _complaintAppService.ReplyAsync(id, input);
            return Ok();
        }

        [HttpPost("upload-attachment")] // POST /api/complaints/upload-attachment
        [Authorize]
        public async Task<IActionResult> UploadAttachment(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileName = $"complaint_{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = await _fileStorageService.SaveFileAsync(ms.ToArray(), fileName, "complaint-attachments");
            return Ok(new { path = filePath });
        }

        [HttpGet("download-attachment/{fileName}")]
        [Authorize]
        public async Task<IActionResult> DownloadAttachment(string fileName)
        {
            var filePath = Path.Combine("complaint-attachments", fileName);
            if (!System.IO.File.Exists(filePath))
                return NotFound("Attachment not found");
            var bytes = await _fileStorageService.GetFileAsync(filePath);
            return File(bytes, "application/octet-stream", fileName);
        }

        [HttpPost("admin/escalate/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Escalate(Guid id, [FromBody] string reason)
        {
            await _complaintAppService.EscalateAsync(id, reason);
            return Ok();
        }

        [HttpPost("admin/assign/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Assign(Guid id, [FromBody] Guid adminId)
        {
            await _complaintAppService.AssignAsync(id, adminId);
            return Ok();
        }

        [HttpPost("admin/reopen/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Reopen(Guid id)
        {
            await _complaintAppService.ReopenAsync(id);
            return Ok();
        }

        [HttpGet("admin/audit-logs")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] Guid? complaintId = null)
        {
            var logs = await _complaintAppService.GetAuditLogsAsync(complaintId);
            return Ok(logs);
        }

        [HttpGet("admin/stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _complaintAppService.GetComplaintStatsAsync();
            return Ok(stats);
        }
    }
}  