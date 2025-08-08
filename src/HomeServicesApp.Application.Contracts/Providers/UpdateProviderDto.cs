using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Providers
{
    public class UpdateProviderDto
    {
        [MaxLength(256)]
        public string Specialization { get; set; }

        public List<string> ServiceCategories { get; set; } = new List<string>();

        [MaxLength(2048)]
        public string Bio { get; set; }

        public bool IsAvailable { get; set; }

        [MaxLength(256)]
        public string IdAttachmentPath { get; set; }

        [MaxLength(256)]
        public string CRAttachmentPath { get; set; }

        [MaxLength(256)]
        public string BusinessLicenseAttachmentPath { get; set; }

        [MaxLength(256)]
        public string InsuranceCertificatePath { get; set; }

        [MaxLength(50)]
        public string TaxIdNumber { get; set; }

        [MaxLength(512)]
        public string Address { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        [MaxLength(512)]
        public string ServiceArea { get; set; }

        public List<string> ProfileImages { get; set; } = new List<string>();

        public List<string> BusinessImages { get; set; } = new List<string>();

        public List<CreateProviderCertificationDto> Certifications { get; set; } = new List<CreateProviderCertificationDto>();

        public List<CreateProviderAvailabilityDto> Availability { get; set; } = new List<CreateProviderAvailabilityDto>();

        public CreateProviderBankInfoDto BankInfo { get; set; }

        public List<CreateProviderReferenceDto> References { get; set; } = new List<CreateProviderReferenceDto>();
    }

    public class CreateProviderCertificationDto
    {
        [Required]
        [MaxLength(128)]
        public string Name { get; set; }

        [Required]
        [MaxLength(128)]
        public string IssuingOrganization { get; set; }

        [Required]
        public DateTime IssueDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        [MaxLength(64)]
        public string CertificateNumber { get; set; }

        [MaxLength(256)]
        public string AttachmentPath { get; set; }
    }

    public class CreateProviderAvailabilityDto
    {
        [Required]
        [MaxLength(20)]
        public string DayOfWeek { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        public bool IsAvailable { get; set; } = true;
    }

    public class CreateProviderBankInfoDto
    {
        [Required]
        [MaxLength(128)]
        public string BankName { get; set; }

        [Required]
        [MaxLength(128)]
        public string AccountHolderName { get; set; }

        [Required]
        [MaxLength(32)]
        public string AccountNumber { get; set; }

        [MaxLength(32)]
        public string RoutingNumber { get; set; }

        [MaxLength(32)]
        public string SwiftCode { get; set; }
    }

    public class CreateProviderReferenceDto
    {
        [Required]
        [MaxLength(128)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; }

        [Required]
        [Phone]
        [MaxLength(32)]
        public string PhoneNumber { get; set; }

        [Required]
        [MaxLength(64)]
        public string Relationship { get; set; }

        [MaxLength(128)]
        public string Company { get; set; }
    }
}  