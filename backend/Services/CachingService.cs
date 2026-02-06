using System.Text.Json;
using StackExchange.Redis;

namespace AudioArchive.Services
{
  public class CachingService(IConnectionMultiplexer _redis) : ICachingService
  {
    public async Task SetValueAsync<T>(string key, T value) {
      var json = JsonSerializer.Serialize(value);
      var database = _redis.GetDatabase();
      await database.StringSetAsync(key, json, TimeSpan.FromMinutes(60), ValueCondition.Always);
    }

    public async Task<T?> GetValueAsync<T>(string key) {
      var database = _redis.GetDatabase();
      var json = await database.StringGetAsync(key);
      if (json.HasValue) {
        var objects = JsonSerializer.Deserialize<T>(json.ToString());

        if (objects == null) {
          await database.StringDeleteAsync(key, ValueCondition.Exists);
          return default;
        }

        return objects;
      }

      return default;
    }
  }
}
