using AudioArchive.Database;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Services
{
  public class TagCleanupService(IServiceProvider _services) : BackgroundService
  {
    private readonly TimeSpan _interval = TimeSpan.FromDays(7);
    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
      while (!stoppingToken.IsCancellationRequested) {
        await CleanupOrphanTags();
        await Task.Delay(_interval, stoppingToken);
      }
    }

    private async Task CleanupOrphanTags() {
      using var scope = _services.CreateScope();
      var db = scope.ServiceProvider.GetRequiredService<AudioDatabaseContext>();

      var deleted = await db.Database.ExecuteSqlRawAsync(""" 
        DELETE FROM tags t
        USING (
          SELECT t."Id"
          FROM tags t
          LEFT JOIN audio_metadata_tags amt ON t."Id" = amt."TagsId"
          WHERE amt."TagsId" IS NULL
        ) orphans
        WHERE t."Id" = orphans."Id";
      """);

      Console.WriteLine($"Deleted {deleted} orphan tags.");
    }
  }
}
