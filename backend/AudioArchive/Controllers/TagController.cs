using AudioArchive.Database;
using AudioArchive.Models;
using AudioArchive.Services;
using AudioArchive.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Controllers
{
  [Route("api/tag")]
  [ApiController]
  public class TagController(AudioDatabaseContext database_, ITagService _service) : ControllerBase
  {
    [HttpGet]
    public async Task<IActionResult> GetTags() {
      var tags = await database_.Tags
        .Include(t => t.AudioMetadatas)
        .Select(t => new {
          t.Name,
          t.Description,
          AudioCount = t.AudioMetadatas == null ? 0 : t.AudioMetadatas.Count
        }).ToListAsync();
      return base.Ok(
        new {
          tags.Count,
          Data = tags
        }
      );
    }

    [HttpDelete("{tagId}")]
    public async Task<IActionResult> DeleteTag([FromRoute] string tagId) {
      if (!Guid.TryParse(tagId, out var tagGuid))
        throw new BadRequestException(
          Message: "Could not parse given string into a valid guid.",
          Target: tagId
        );

      var tag = await database_.Tags.FindAsync(tagGuid) ??
        throw new NotFoundException(
          Message: "Could not find tag entry.",
          Target: tagId
        );

      database_.Tags.Remove(tag);
      await database_.SaveChangesAsync();
      return base.Ok(tag);
    }

    [HttpPatch("{tagId}")]
    public async Task<IActionResult> UpdateTag([FromRoute] string tagId, [FromBody] PatchTagRequest body) {
      if (!Guid.TryParse(tagId, out var tagGuid))
        throw new BadRequestException(
          Message: "Could not parse given string into a valid guid.",
          Target: tagId
        );

      var tag = await _service.UpdateTagProperties(tagGuid, body);
      return base.Ok(new { tag.Name, tag.Description });
    }
  }
}
