using AudioArchive.Database;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Services
{
  public class TagService(DatabaseContext database) : ITagService
  {
    public async Task<int> CleanupOrphanTags() {
      return await database.Database.ExecuteSqlRawAsync("""
        DELETE FROM tags t
        USING (
          SELECT t."Id"
          FROM tags t
          LEFT JOIN audio_metadata_tags amt ON t."Id" = amt."TagsId"
          WHERE amt."TagsId" IS NULL
        ) orphans
        WHERE t."Id" = orphans."Id";
      """);
    }
  }
}
