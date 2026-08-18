using AudioArchive.Database.Entity;

namespace AudioArchive.Services
{
  public interface ITagService
  {
    Task<int> CleanupOrphanTags();
    Task<List<Tag>> GetTags();
    Task<Tag> CreateTag(string name, string? description = null);
    Task<int> MergeTags(Guid sourceTagId, Guid targetTagId);
  }
}
