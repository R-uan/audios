namespace AudioArchive.Services
{
  public interface ICachingService
  {
    Task DeleteCache(string key);
    Task<T?> GetValueAsync<T>(string key);
    Task SetValueAsync<T>(string key, T value);
  }
}
