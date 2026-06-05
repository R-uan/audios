using System.Text.Json;
using StackExchange.Redis;

namespace AudioArchive.Services
{
  public class CachingService(IConnectionMultiplexer redis) : ICachingService
  {
    private readonly IDatabase database = redis.GetDatabase();
    private readonly IServer server = redis.GetServer(redis.GetEndPoints()[0]);

    public async Task SetAsync<T>(string group, string key, T value) {
      var fullKey = $"{group}:{key}";
      var json = JsonSerializer.Serialize(value);
      var expiration = TimeSpan.FromMinutes(5);
      await database.StringSetAsync(fullKey, json, expiration, ValueCondition.Always);
    }

    public async Task<T?> GetAsync<T>(string group, string key, Func<Task<T>>? factory = null) {
      var fullKey = $"{group}:{key}";
      var cached = await database.StringGetAsync(fullKey);

      if (cached.HasValue) {
        var objects = JsonSerializer.Deserialize<T>(cached.ToString());
        if (objects != null) return objects;
      }

      if (factory != null) {
        var data = await factory();
        await SetAsync(group, key, data);
        return data;
      }

      return default;
    }

    async Task ICachingService.DeleteCache(string key) {
      await database.StringDeleteAsync(key, ValueCondition.Exists);
    }

    public async Task DeleteGroupAsync(string group) {
      var keys = server.Keys(pattern: $"{group}:*").ToArray();
      if (keys.Length > 0) {
        await database.KeyDeleteAsync(keys);
      }
    }
  }
}
