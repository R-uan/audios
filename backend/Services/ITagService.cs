namespace AudioArchive.Services
{
  public interface ITagService
  {
    Task<int> CleanupOrphanTags();
  }
}
