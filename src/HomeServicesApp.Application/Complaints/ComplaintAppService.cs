using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Complaints;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using Microsoft.AspNetCore.Authorization;
using HomeServicesApp;
using Volo.Abp.Identity;

namespace HomeServicesApp.Complaints
{
    public class ComplaintAppService : ApplicationService, IComplaintAppService
    {
        private readonly IRepository<Complaint, Guid> _complaintRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IEmailSender _emailSender;
        private readonly string _adminEmail;
        private readonly IIdentityUserRepository _userRepository;
        private readonly ISmsSender _smsSender;
        private readonly IPushNotificationSender _pushSender;
        private readonly IRepository<AuditLog, Guid> _auditLogRepository;

        public ComplaintAppService(
            IRepository<Complaint, Guid> complaintRepository,
            ICurrentUser currentUser,
            IEmailSender emailSender,
            Microsoft.Extensions.Configuration.IConfiguration config,
            IIdentityUserRepository userRepository,
            ISmsSender smsSender,
            IPushNotificationSender pushSender,
            IRepository<AuditLog, Guid> auditLogRepository)
        {
            _complaintRepository = complaintRepository;
            _currentUser = currentUser;
            _emailSender = emailSender;
            _adminEmail = config["Complaints:AdminEmail"] ?? "admin@example.com";
            _userRepository = userRepository;
            _smsSender = smsSender;
            _pushSender = pushSender;
            _auditLogRepository = auditLogRepository;
        }

        [Authorize]
        public async Task<ComplaintDto> CreateAsync(CreateComplaintDto input)
        {
            var complaint = new Complaint(GuidGenerator.Create())
            {
                UserId = _currentUser.GetId(),
                Message = input.Message,
                Status = "جديد",
                AdminReply = null,
                AttachmentPath = input.AttachmentPath,
                IsEscalated = false,
                EscalationReason = null,
                AssignedAdminId = null
            };
            await _complaintRepository.InsertAsync(complaint);
            await LogAudit(complaint.Id, "Create", input.Message);
            // Notify admin
            await _emailSender.SendEmailAsync(_adminEmail, "New Complaint Submitted", $"A new complaint was submitted by user: {_currentUser.UserName}.\nMessage: {input.Message}");
            await _smsSender.SendSmsAsync("admin-phone", $"New complaint from {_currentUser.UserName}"); // Replace with real admin phone
            await _pushSender.SendPushAsync("admin-id", "New Complaint", $"From: {_currentUser.UserName}"); // Replace with real admin id
            return MapToDto(complaint);
        }

        [Authorize]
        public async Task<List<ComplaintDto>> GetMyComplaintsAsync()
        {
            var userId = _currentUser.GetId();
            var complaints = await _complaintRepository.GetListAsync(x => x.UserId == userId);
            return complaints.Select(MapToDto).OrderByDescending(c => c.CreationTime).ToList();
        }

        [Authorize("Admin")]
        public async Task<List<ComplaintDto>> GetAllAsync()
        {
            var complaints = await _complaintRepository.GetListAsync();
            return complaints.Select(MapToDto).OrderByDescending(c => c.CreationTime).ToList();
        }

        [Authorize("Admin")]
        public async Task ReplyAsync(Guid id, AdminReplyDto input)
        {
            var complaint = await _complaintRepository.GetAsync(id);
            complaint.AdminReply = input.Reply;
            complaint.Status = "مغلق";
            await _complaintRepository.UpdateAsync(complaint);
            await LogAudit(id, "Reply", input.Reply);
            // Notify user
            var user = await _userRepository.GetAsync(complaint.UserId);
            if (!string.IsNullOrEmpty(user.Email))
            {
                await _emailSender.SendEmailAsync(user.Email, "Your Complaint Has Been Answered", $"Admin reply: {input.Reply}");
            }
            if (!string.IsNullOrEmpty(user.PhoneNumber))
            {
                await _smsSender.SendSmsAsync(user.PhoneNumber, "Your complaint has been answered by admin.");
            }
            await _pushSender.SendPushAsync(user.Id.ToString(), "Complaint Answered", "Admin replied to your complaint.");
        }

        [Authorize("Admin")]
        public async Task EscalateAsync(Guid id, string reason)
        {
            var complaint = await _complaintRepository.GetAsync(id);
            complaint.IsEscalated = true;
            complaint.EscalationReason = reason;
            await _complaintRepository.UpdateAsync(complaint);
            await LogAudit(id, "Escalate", reason);
        }

        [Authorize("Admin")]
        public async Task AssignAsync(Guid id, Guid adminId)
        {
            var complaint = await _complaintRepository.GetAsync(id);
            complaint.AssignedAdminId = adminId;
            await _complaintRepository.UpdateAsync(complaint);
            await LogAudit(id, "Assign", adminId.ToString());
        }

        [Authorize("Admin")]
        public async Task ReopenAsync(Guid id)
        {
            var complaint = await _complaintRepository.GetAsync(id);
            complaint.Status = "جديد";
            complaint.AdminReply = null;
            await _complaintRepository.UpdateAsync(complaint);
            await LogAudit(id, "Reopen");
        }

        private async Task LogAudit(Guid complaintId, string action, string details = null)
        {
            await _auditLogRepository.InsertAsync(new AuditLog
            {
                ComplaintId = complaintId,
                Action = action,
                UserId = _currentUser.Id,
                Details = details
            });
        }

        private ComplaintDto MapToDto(Complaint c)
        {
            return new ComplaintDto
            {
                Id = c.Id,
                UserId = c.UserId,
                Message = c.Message,
                Status = c.Status,
                AdminReply = c.AdminReply,
                CreationTime = c.CreationTime,
                AttachmentPath = c.AttachmentPath,
                IsEscalated = c.IsEscalated,
                EscalationReason = c.EscalationReason,
                AssignedAdminId = c.AssignedAdminId
            };
        }

        [Authorize("Admin")]
        public async Task<List<AuditLogDto>> GetAuditLogsAsync(Guid? complaintId = null)
        {
            var logs = complaintId == null
                ? await _auditLogRepository.GetListAsync()
                : (await _auditLogRepository.GetListAsync(x => x.ComplaintId == complaintId.Value));
            return logs.OrderByDescending(x => x.CreationTime).Select(x => new AuditLogDto
            {
                Id = x.Id,
                ComplaintId = x.ComplaintId,
                Action = x.Action,
                UserId = x.UserId,
                Details = x.Details,
                CreationTime = x.CreationTime
            }).ToList();
        }

        [Authorize("Admin")]
        public async Task<object> GetComplaintStatsAsync()
        {
            var all = await _complaintRepository.GetListAsync();
            return new
            {
                Total = all.Count,
                ByStatus = all.GroupBy(x => x.Status).ToDictionary(g => g.Key, g => g.Count()),
                Escalated = all.Count(x => x.IsEscalated),
                ByUser = all.GroupBy(x => x.UserId).ToDictionary(g => g.Key, g => g.Count())
            };
        }
    }

    public interface IComplaintAppService
    {
        Task<ComplaintDto> CreateAsync(CreateComplaintDto input);
        Task<List<ComplaintDto>> GetMyComplaintsAsync();
        Task<List<ComplaintDto>> GetAllAsync();
        Task ReplyAsync(Guid id, AdminReplyDto input);
        Task EscalateAsync(Guid id, string reason);
        Task AssignAsync(Guid id, Guid adminId);
        Task ReopenAsync(Guid id);
        Task<List<AuditLogDto>> GetAuditLogsAsync(Guid? complaintId = null);
        Task<object> GetComplaintStatsAsync();
    }
} 