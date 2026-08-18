using AudioArchive.Database.Entity;

namespace AudioArchive.Services
{
  public interface ITagService
  {
    Task<int> CleanupOrphanTags();
    Task<List<Tag>> GetTags();
    Task<int> MergeTags(Guid sourceTagId, Guid targetTagId);
  }
}
