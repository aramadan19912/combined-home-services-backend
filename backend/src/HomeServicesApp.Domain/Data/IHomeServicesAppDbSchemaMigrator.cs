using System.Threading.Tasks;

namespace HomeServicesApp.Data;

public interface IHomeServicesAppDbSchemaMigrator
{
    Task MigrateAsync();
}
