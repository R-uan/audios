namespace AudioArchive.Services {
  public interface ICachingService {
    Task<T?> GetValueAsync<T>(string key);
    Task SetValueAsync<T>(string key, T value);
  }
}
