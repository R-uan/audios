namespace AudioArchive.Services
{
  public interface ICachingService
  {
    Task DeleteCache(string key);
    Task DeleteGroupAsync(string group);
    Task SetAsync<T>(string group, string key, T value);
    Task<T?> GetAsync<T>(string group, string key, Func<Task<T>>? factory = null);
  }
}
