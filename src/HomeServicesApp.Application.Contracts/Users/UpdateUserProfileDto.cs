using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Users
{
    public class UpdateUserProfileDto
    {
        [Required]
        [MaxLength(128)]
        public string FullName { get; set; }

        [MaxLength(256)]
        public string Address { get; set; }

        [MaxLength(20)]
        public string PhoneNumber { get; set; }

        [MaxLength(256)]
        public string ProfileImage { get; set; }
    }
} 