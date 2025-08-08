using System;
using System.Collections.Generic;

namespace HomeServicesApp.Providers
{
    public class ProviderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Specialization { get; set; }
        public List<string> ServiceCategories { get; set; } = new List<string>();
        public string Bio { get; set; }
        public double AverageRating { get; set; }
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public bool IsAvailable { get; set; }
        public string ApprovalStatus { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string RejectionReason { get; set; }
        public string IdAttachmentPath { get; set; }
        public string CRAttachmentPath { get; set; }
        public string BusinessLicenseAttachmentPath { get; set; }
        public string InsuranceCertificatePath { get; set; }
        public string TaxIdNumber { get; set; }
        public string Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string ServiceArea { get; set; }
        public decimal WalletBalance { get; set; }
        public List<string> ProfileImages { get; set; } = new List<string>();
        public List<string> BusinessImages { get; set; } = new List<string>();
        public List<ProviderCertificationDto> Certifications { get; set; } = new List<ProviderCertificationDto>();
        public List<ProviderAvailabilityDto> Availability { get; set; } = new List<ProviderAvailabilityDto>();
        public ProviderBankInfoDto BankInfo { get; set; }
        public List<ProviderReferenceDto> References { get; set; } = new List<ProviderReferenceDto>();
        public ProviderVerificationDto Verification { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastActiveAt { get; set; }
        public bool BackgroundCheckCompleted { get; set; }
        public DateTime? BackgroundCheckDate { get; set; }
        public string BackgroundCheckStatus { get; set; }
    }

    public class ProviderCertificationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string IssuingOrganization { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string CertificateNumber { get; set; }
        public string AttachmentPath { get; set; }
        public bool IsVerified { get; set; }
    }

    public class ProviderAvailabilityDto
    {
        public string DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
    }

    public class ProviderBankInfoDto
    {
        public string BankName { get; set; }
        public string AccountHolderName { get; set; }
        public string AccountNumber { get; set; }
        public string RoutingNumber { get; set; }
        public string SwiftCode { get; set; }
        public bool IsVerified { get; set; }
    }

    public class ProviderReferenceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Relationship { get; set; }
        public string Company { get; set; }
        public bool IsContacted { get; set; }
        public DateTime? ContactedAt { get; set; }
        public string Notes { get; set; }
    }

    public class ProviderVerificationDto
    {
        public bool EmailVerified { get; set; }
        public bool PhoneVerified { get; set; }
        public bool IdentityVerified { get; set; }
        public bool BusinessLicenseVerified { get; set; }
        public bool InsuranceVerified { get; set; }
        public bool BackgroundCheckPassed { get; set; }
        public bool ReferencesVerified { get; set; }
        public int VerificationScore { get; set; }
        public List<string> PendingVerifications { get; set; } = new List<string>();
    }

    public class ProviderEarningsDto
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public int OrderCount { get; set; }
        public string Period { get; set; }
    }
}  