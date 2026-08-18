using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Shared;
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

    public async Task<List<Tag>> GetTags() {
      return await database.Tags.AsNoTracking().OrderBy(t => t.Name).ToListAsync();
    }

    public async Task<Tag> CreateTag(string name, string? description = null) {
      if (string.IsNullOrWhiteSpace(name))
        throw new BadRequestException("Tag name is required.", name ?? "");

      var tag = new Tag(name.Trim()) {
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim()
      };

      if (await database.Tags.AnyAsync(t => t.Name.ToLower() == tag.Name.ToLower()))
        throw new BadRequestException("Tag already exists.", tag.Name);

      await database.Tags.AddAsync(tag);
      await database.SaveChangesAsync();

      return tag;
    }

    public async Task<int> MergeTags(Guid sourceTagId, Guid targetTagId) {
      if (sourceTagId == targetTagId)
        throw new BadRequestException("Source and target tags must be different.", sourceTagId.ToString());

      if (!await database.Tags.AnyAsync(t => t.Id == sourceTagId))
        throw new NotFoundException("Could not find source tag.", sourceTagId.ToString());

      if (!await database.Tags.AnyAsync(t => t.Id == targetTagId))
        throw new NotFoundException("Could not find target tag.", targetTagId.ToString());

      await using var transaction = await database.Database.BeginTransactionAsync();

      await database.Database.ExecuteSqlRawAsync("""
        INSERT INTO audio_metadata_tags ("AudioMetadatasId", "TagsId")
        SELECT amt."AudioMetadatasId", {0}
        FROM audio_metadata_tags amt
        WHERE amt."TagsId" = {1}
          AND NOT EXISTS (
            SELECT 1 FROM audio_metadata_tags t2
            WHERE t2."AudioMetadatasId" = amt."AudioMetadatasId"
              AND t2."TagsId" = {0}
          );
      """, targetTagId, sourceTagId);

      var affected = await database.Database.ExecuteSqlRawAsync("""
        DELETE FROM audio_metadata_tags WHERE "TagsId" = {0};
      """, sourceTagId);

      await database.Database.ExecuteSqlRawAsync("""
        DELETE FROM tags WHERE "Id" = {0};
      """, sourceTagId);

      await transaction.CommitAsync();

      return affected;
    }
  }
}
