using AudioArchive.Database.Entity;
using AudioArchive.Models;

namespace AudioArchive.Services
{
  public interface ITagService
  {
    Task<Tag> UpdateTagProperties(Guid guid, PatchTagRequest request);
  }
}
