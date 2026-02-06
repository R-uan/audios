using AudioArchive.Models;
using AudioArchive.Services;
using AudioArchive.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AudioArchive.Database.Entity;
using AudioArchive.Shared;

namespace AudioArchive.Controllers {
  [ApiController]
  [Route("api/audio")]
  public class AudioController(
      AudioDatabaseContext _database,
      IAudioService _service,
      ICachingService _caching
      ) : ControllerBase {
    [HttpGet]
    public async Task<IActionResult> GetAudios() {
      var audios = await _caching.GetValueAsync<List<PartialAudioView>>("getAudios");

      if (audios == null) {
        audios = await _database.Audios.Select(audio => new PartialAudioView {
          Id = audio.Id,
          Title = audio.Title,
          Artist = audio.Artist.Name,
          Source = audio.Source,
          Link = audio.Link,
          AddedAt = audio.AddedAt,
          Duration = audio.Metadata != null ? audio.Metadata.Duration : 0
        }).ToListAsync();

        await _caching.SetValueAsync("getAudios", audios);
      }

      return Ok(new {
        audios.Count,
        Data = audios,
      });
    }

    [HttpGet("{audioId}")]
    public async Task<IActionResult> GetAudio([FromRoute] string audioId, [FromQuery] bool full = false) {
      if (!Guid.TryParse(audioId, out var id)) return base.BadRequest("The Audio ID is invalid.");
      var audio = await _caching.GetValueAsync<Audio>(audioId);

      if (audio == null) {
        audio = await _database.Audios.Include(a => a.Artist)
          .Include(a => a.Metadata).ThenInclude(m => m.Tags)
          .Where(a => a.Id == id).FirstOrDefaultAsync()
          ?? throw new NotFoundException("Audio", audioId);

        await _caching.SetValueAsync(audioId, audio);
      }

      return full ?
        base.Ok(FullAudioView.FromAudio(audio)) :
        base.Ok(PartialAudioView.FromAudio(audio));
    }

    [HttpPost]
    public async Task<IActionResult> PostAudio([FromBody] PostAudioRequest request)
      => base.Ok(await _service.StoreAudio(request));

    [HttpPost("bulk")]
    public async Task<IActionResult> PostMultipleAudios([FromBody] List<PostAudioRequest> request)
      => Ok(await _service.BulkStoreAudio(request));

    [HttpDelete("{audioId}")]
    public async Task<IActionResult> DeleteAudio([FromRoute] string audioId) {
      if (!Guid.TryParse(audioId, out var id))
        return base.BadRequest("The Audio ID is invalid.");

      var audio = await _database.Audios.FindAsync(id)
        ?? throw new NotFoundException("Audio", audioId);

      _database.Audios.Remove(audio);
      await _database.SaveChangesAsync();

      return Ok(new { Success = true, Target = audioId });
    }

    [HttpGet("q")]
    public async Task<IActionResult> QueryAudios([FromQuery] AudioSearchParams parameters) {
      // The path containst the query (or I assume) so it can be used as the key for caching;
      var requestPath = HttpContext.Request.Path.ToString();
      var audios = await _caching.GetValueAsync<List<PartialAudioView>>(requestPath);

      if (audios == null) {
        audios = await _service.QueryAudios(parameters);
        await _caching.SetValueAsync(requestPath, audios);
      }

      return base.Ok(new {
        audios.Count,
        Data = audios
      });
    }

    [HttpPatch("{audioId}")]
    public async Task<IActionResult>
      PatchAudio([FromRoute] Guid audioId, [FromBody] PatchAudioRequest request) =>
        Ok(await _service.UpdateAudio(audioId, request));
  }
}
