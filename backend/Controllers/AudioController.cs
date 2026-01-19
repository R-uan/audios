using AudioArchive.Models;
using AudioArchive.Services;
using AudioArchive.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Controllers {
  [ApiController]
  [Route("api/audio")]
  public class AudioController(AudioDatabaseContext database, IAudioService service_) : ControllerBase {
    [HttpGet]
    public async Task<IActionResult> GetAudios() {
      var audios = await database.Audios
        .Select(audio => new PartialAudioView {
          Id = audio.Id,
          Title = audio.Title,
          Artist = audio.Artist.Name,
          Source = audio.Source,
          Link = audio.Link,
          AddedAt = audio.AddedAt,
          Duration = audio.Metadata != null ? audio.Metadata.Duration : 0
        })
        .ToListAsync();
      return Ok(audios);
    }

    [HttpGet("{audioId}")]
    public async Task<IActionResult> GetAudio([FromRoute] string audioId, [FromQuery] bool full = false) {
      if (!Guid.TryParse(audioId, out var id)) return BadRequest("Invalid audio id.");

      var audio = await database.Audios
        .Include(a => a.Artist)
        .Include(a => a.Metadata)
          .ThenInclude(m => m.Tags)
        .Where(a => a.Id == id)
        .FirstOrDefaultAsync();

      if (audio == null) return NotFound();

      return full ?
        base.Ok(FullAudioView.FromAudio(audio)) :
        base.Ok(PartialAudioView.FromAudio(audio));
    }

    [HttpPost]
    public async Task<IActionResult> PostAudio([FromBody] PostAudioRequest request) {
      try {
        var audioView = await service_.StoreAudio(request);
        return Ok(audioView);
      } catch (Exception) {
        Console.WriteLine("Get a real logger");
        return StatusCode(500);
      }
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> PostMultipleAudios([FromBody] List<PostAudioRequest> request) {
      try {
        var audioView = await service_.BulkStoreAudio(request);
        return Ok(audioView);
      } catch (Exception ex) {
        Console.WriteLine(ex);
        return StatusCode(500);
      }
    }

    [HttpDelete("{audioId}")]
    public async Task<IActionResult> DeleteAudio([FromRoute] int audioId) {
      try {
        var audio = await database.Audios.FindAsync(audioId);
        if (audio == null) return NotFound($"Audio not found {audioId}");
        database.Audios.Remove(audio);
        await database.SaveChangesAsync();
        return Ok();
      } catch (Exception) {
        Console.WriteLine("get a real logger");
        return StatusCode(500);
      }
    }

    [HttpGet("q")]
    public async Task<IActionResult> QueryAudios([FromQuery] AudioSearchParams parameters) {
      try {
        var query = database.Audios.AsQueryable();
        if (!string.IsNullOrEmpty(parameters.Artist)) {
          query = query.Where(a => EF.Functions.ILike(a.Artist.Name, $"%{parameters.Artist}%"));
        }

        if (!string.IsNullOrEmpty(parameters.Title)) {
          query = query.Where(a => EF.Functions.ILike(a.Title, $"%{parameters.Title}%"));
        }

        if (parameters.Tags != null) {
          foreach (var tag in parameters.Tags) {
            query = query.Where(a => a.Metadata!.Tags != null && a.Metadata!.Tags.Any(t => t.Name == tag));
          }
        }

        if (parameters.MinDuration > 0) {
          query = query.Where(a => a.Metadata!.Tags != null && a.Metadata.Duration >= parameters.MinDuration);
        }

        if (parameters.MaxDuration > 0) {
          query = query.Where(a => a.Metadata!.Duration != null && a.Metadata!.Duration <= parameters.MaxDuration);
        }

        var audios = await query.Select(audio => new PartialAudioView {
          Id = audio.Id,
          Title = audio.Title,
          Artist = audio.Artist.Name,
          Source = audio.Source,
          Link = audio.Link,
          AddedAt = audio.AddedAt,
          Duration = audio.Metadata != null ? audio.Metadata.Duration : 0
        }).ToListAsync();
        return Ok(audios);
      } catch (Exception) {
        Console.WriteLine("get a real logger");
        return StatusCode(500);
      }
    }
  }
}
