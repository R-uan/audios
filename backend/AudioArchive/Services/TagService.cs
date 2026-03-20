using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using AudioArchive.Shared;

namespace AudioArchive.Services
{
  public class TagService(AudioDatabaseContext _database) : ITagService
  {
    public async Task<Tag> UpdateTagProperties(Guid guid, PatchTagRequest request) {
      var tag = await _database.Tags.FindAsync(guid) ??
        throw new NotFoundException(
          Message: "Could not find tag entry.",
          Target: guid.ToString()
        );

      if (!string.IsNullOrEmpty(request.Name)) tag.Name = request.Name.Trim();
      if (!string.IsNullOrEmpty(request.Description)) tag.Description = request.Description.Trim();

      await _database.SaveChangesAsync();
      return tag;
    }
  }
}
