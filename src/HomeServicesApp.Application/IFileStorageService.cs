using System.Threading.Tasks;

namespace HomeServicesApp
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(byte[] content, string fileName, string folder);
        Task<byte[]> GetFileAsync(string filePath);
        Task DeleteFileAsync(string filePath);
    }
} 