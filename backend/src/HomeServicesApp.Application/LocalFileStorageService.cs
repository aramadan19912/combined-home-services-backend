using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace HomeServicesApp
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly string _rootFolder;
        public LocalFileStorageService(IConfiguration configuration)
        {
            _rootFolder = configuration["FileStorage:RootFolder"] ?? "uploads";
            if (!Directory.Exists(_rootFolder))
                Directory.CreateDirectory(_rootFolder);
        }
        public async Task<string> SaveFileAsync(byte[] content, string fileName, string folder)
        {
            var dir = Path.Combine(_rootFolder, folder);
            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir);
            var filePath = Path.Combine(dir, fileName);
            await File.WriteAllBytesAsync(filePath, content);
            return filePath;
        }
        public async Task<byte[]> GetFileAsync(string filePath)
        {
            return await File.ReadAllBytesAsync(filePath);
        }
        public Task DeleteFileAsync(string filePath)
        {
            if (File.Exists(filePath))
                File.Delete(filePath);
            return Task.CompletedTask;
        }
    }
} 