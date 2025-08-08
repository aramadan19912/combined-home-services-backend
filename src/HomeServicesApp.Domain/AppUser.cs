using System;
using Volo.Abp.Identity;

namespace HomeServicesApp
{
    public enum UserType
    {
        Customer = 0,
        Provider = 1
    }

    public class AppUser : IdentityUser
    {
        public string FullName { get; set; }
        public string Address { get; set; }
        public string ProfileImage { get; set; }
        public UserType UserType { get; set; }
        public bool IsVerified { get; set; }
    }
} 