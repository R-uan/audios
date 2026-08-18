using AudioArchive.Database;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace AudioArchive.Extensions
{
  public static class DatabaseExtensions
  {
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration) {
      services.AddDbContext<DatabaseContext>(options => {
        var connectionString = configuration.GetConnectionString("Postgres");
        options.UseNpgsql(connectionString);
      });

      services.AddSingleton<IConnectionMultiplexer>(sp => {
        var connectionString = configuration.GetConnectionString("Redis")
         ?? throw new MissingFieldException("Redis database connection string could not be found");
        var config = ConfigurationOptions.Parse(connectionString);
        return ConnectionMultiplexer.Connect(config);
      });

      return services;
    }
  }
}
