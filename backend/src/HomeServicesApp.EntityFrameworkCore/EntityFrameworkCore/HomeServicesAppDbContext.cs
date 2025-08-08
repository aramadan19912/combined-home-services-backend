using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;

namespace HomeServicesApp.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class HomeServicesAppDbContext :
    AbpDbContext<HomeServicesAppDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    #region Entities from the modules

    /* Notice: We only implemented IIdentityDbContext and ITenantManagementDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityDbContext and ITenantManagementDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    //Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }
    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }
    public DbSet<HomeServicesApp.PaymentTransaction> PaymentTransactions { get; set; }
    public DbSet<HomeServicesApp.RecurringPayment> RecurringPayments { get; set; }
    public DbSet<HomeServicesApp.UserPaymentMethod> UserPaymentMethods { get; set; }
    public DbSet<HomeServicesApp.Order> Orders { get; set; }
    public DbSet<HomeServicesApp.Provider> Providers { get; set; }
    public DbSet<HomeServicesApp.Service> Services { get; set; }
    public DbSet<HomeServicesApp.Review> Reviews { get; set; }
    public DbSet<HomeServicesApp.Complaint> Complaints { get; set; }
    public DbSet<HomeServicesApp.LoyaltyPoint> LoyaltyPoints { get; set; }
    public DbSet<HomeServicesApp.Coupon> Coupons { get; set; }

    #endregion

    public HomeServicesAppDbContext(DbContextOptions<HomeServicesAppDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        /* Configure your own tables/entities inside here */

        builder.Entity<HomeServicesApp.PaymentTransaction>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "PaymentTransactions", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.PaymentMethod).IsRequired().HasMaxLength(64);
            b.Property(x => x.TransactionStatus).IsRequired().HasMaxLength(32);
            b.Property(x => x.ProviderTransactionId).HasMaxLength(128);
            b.Property(x => x.Notes).HasMaxLength(256);
        });

        builder.Entity<HomeServicesApp.RecurringPayment>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "RecurringPayments", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Frequency).IsRequired().HasMaxLength(32);
        });

        builder.Entity<HomeServicesApp.UserPaymentMethod>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "UserPaymentMethods", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.MethodType).IsRequired().HasMaxLength(32);
            b.Property(x => x.MaskedDetails).IsRequired().HasMaxLength(32);
            b.Property(x => x.Provider).HasMaxLength(32);
        });

        builder.Entity<HomeServicesApp.Order>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "Orders", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Address).IsRequired().HasMaxLength(500);
            b.Property(x => x.Status).IsRequired();
            b.Property(x => x.PaymentStatus).IsRequired();
            b.Property(x => x.RecurrenceType).HasMaxLength(50);
            b.Property(x => x.CancellationReason).HasMaxLength(500);
        });

        builder.Entity<HomeServicesApp.Provider>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "Providers", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Specialization).IsRequired().HasMaxLength(200);
            b.Property(x => x.Bio).HasMaxLength(1000);
            b.Property(x => x.ApprovalStatus).IsRequired().HasMaxLength(50);
            b.Property(x => x.Address).HasMaxLength(500);
            b.Property(x => x.RejectionReason).HasMaxLength(500);
        });

        builder.Entity<HomeServicesApp.Service>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "Services", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(200);
            b.Property(x => x.Description).HasMaxLength(1000);
            b.Property(x => x.Category).IsRequired().HasMaxLength(100);
        });

        builder.Entity<HomeServicesApp.Review>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "Reviews", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Comment).HasMaxLength(1000);
            b.Property(x => x.Rating).IsRequired();
        });

        builder.Entity<HomeServicesApp.Complaint>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "Complaints", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Message).IsRequired().HasMaxLength(2000);
            b.Property(x => x.Status).IsRequired().HasMaxLength(50);
            b.Property(x => x.AdminReply).HasMaxLength(2000);
            b.Property(x => x.EscalationReason).HasMaxLength(500);
        });

        builder.Entity<HomeServicesApp.LoyaltyPoint>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "LoyaltyPoints", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Reason).IsRequired().HasMaxLength(200);
        });

        builder.Entity<HomeServicesApp.Coupon>(b =>
        {
            b.ToTable(HomeServicesApp.HomeServicesAppConsts.DbTablePrefix + "Coupons", HomeServicesApp.HomeServicesAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Code).IsRequired().HasMaxLength(50);
        });
    }
}
