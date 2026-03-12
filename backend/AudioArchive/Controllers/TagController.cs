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
      if (!Guid.TryParse(tagId, out var id)) return base.BadRequest("Invalid id");
      var tag = await database_.Tags.FindAsync(id) ?? throw new NotFoundException("Tag", tagId);
      database_.Tags.Remove(tag);
      await database_.SaveChangesAsync();
      return base.Ok(tag);
    }

    [HttpPatch("{tagId}")]
    public async Task<IActionResult> UpdateTag([FromRoute] string tagId, [FromBody] PatchTagRequest body) {
      if (!Guid.TryParse(tagId, out var guid)) return base.BadRequest();
      var tag = await _service.UpdateTagProperties(guid, body);
      return base.Ok(new { tag.Name, tag.Description });
    }
  }
}
