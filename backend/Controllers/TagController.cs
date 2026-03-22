using AudioArchive.Database;
using AudioArchive.Models;
using AudioArchive.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Controllers
{
  [Route("api/tag")]
  [ApiController]
  public class TagController(AudioDatabaseContext database) : ControllerBase
  {
    [HttpGet]
    public async Task<IActionResult> GetTags() {
      var tags = await database.Tags
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

      var tag = await database.Tags.FindAsync(tagGuid) ??
        throw new NotFoundException(
          Message: "Could not find tag entry.",
          Target: tagId
        );

      database.Tags.Remove(tag);
      await database.SaveChangesAsync();

      return base.Ok(new {
        Message = "Tag successfully deleted.",
        Target = tagId
      });
    }

    [HttpPatch("{tagId}")]
    public async Task<IActionResult> UpdateTag([FromRoute] string tagId, [FromBody] PatchTagRequest body) {
      if (!Guid.TryParse(tagId, out var tagGuid)) {
        throw new BadRequestException(
          Message: "Could not parse given string into a valid guid.",
          Target: tagId
        );
      }

      var tag = await database.Tags.FindAsync(tagGuid) ??
        throw new NotFoundException(
          Message: "Could not find tag entry.",
          Target: tagGuid.ToString()
        );

      if (!string.IsNullOrEmpty(body.Name)) tag.Name = body.Name.Trim();
      if (!string.IsNullOrEmpty(body.Description)) tag.Description = body.Description.Trim();

      await database.SaveChangesAsync();

      return base.Ok(new { tag.Name, tag.Description });
    }
  }
}
