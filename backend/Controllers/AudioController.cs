using AudioArchive.Models;
using AudioArchive.Models.Views;
using AudioArchive.Services;
using AudioArchive.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AudioArchive.Database.Entity;
using AudioArchive.Shared;
using Microsoft.AspNetCore.Http.Extensions;

namespace AudioArchive.Controllers
{
  [ApiController]
  [Route("api/audio")]
  public class AudioController(
      AudioDatabaseContext _database,
      IAudioService _service,
      ICachingService _caching)
    : ControllerBase
  {

    [HttpGet]
    public async Task<IActionResult> GetAudios() {
      var audios = await cachingService.GetAsync(CacheGroup, "all", () => {
        return databaseContext.Audios
              .Include(a => a.Metadata)
              .Select(audio => new AudioView {
                Id = audio.Id,
                Title = audio.Title,
                Artist = audio.Artist.Name,
                Source = audio.Source,
                Link = audio.Link,
                Local = audio.Local,
                AddedAt = audio.AddedAt,
                Metadata = new AudioMetadataView {
                  Duration = audio.Metadata.Duration,
                  Genre = audio.Metadata.Genre,
                  ReleaseYear = audio.Metadata.ReleaseYear,
                  Tags = audio.Metadata.Tags.Select(t => t.Name).Order().ToList(),
                }
              }).OrderBy(a => a.Title).ToListAsync();
      });

      return Ok(new {
        Data = audios,
        Count = audios == null ? 0 : audios.Count,
        AudiosOverallDuration = audios?.Sum(a => a.Metadata.Duration),
      });
    }

    [HttpGet("{audioId}")]
    public async Task<IActionResult> GetAudio([FromRoute] string audioId) {
      if (Guid.TryParse(audioId, out var audioGuid))
        throw new BadRequestException(
          Message: "Could not parse given string into a valid guid.",
          Target: audioId
        );

      var audio = await _database.Audios.Include(a => a.Artist)
        .Include(a => a.Metadata).ThenInclude(m => m.Tags)
        .Where(a => a.Id == audioGuid).FirstOrDefaultAsync() ??
          throw new NotFoundException(
            Message: "Could not find audio entry.",
            Target: audioId
          );

      return base.Ok(AudioView.From(audio));
    }

    [HttpPost]
    public async Task<IActionResult> PostAudio([FromBody] PostAudioRequest request) {
      Console.WriteLine($"is local: {request.Local}");
      return base.Ok(AudioView.From(await _service.StoreAudio(request)));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> PostMultipleAudios([FromBody] List<PostAudioRequest> request) {
      List<AudioView> savedAudios = [];
      List<string> failedAdditions = [];
      List<string> duplicatedAudios = [];

      foreach (var entry in request) {
        try {
          var audio = await _service.StoreAudio(entry);
          savedAudios.Add(AudioView.From(audio));
        } catch (Exception e) {
          if (e is DuplicatedAudioException) {
            duplicatedAudios.Add(entry.Link ?? entry.Source);
            continue;
          } else {
            duplicatedAudios.Add(entry.Link ?? entry.Source);
            continue;
          }
        }
      }

      await _caching.DeleteCache("audio:all");
      return base.Ok(new {
        SavedAudios = savedAudios,
        FailedAdditions = failedAdditions,
        DuplicatedAudios = duplicatedAudios,
      });
    }

    [HttpDelete("{audioId}")]
    public async Task<IActionResult> DeleteAudio([FromRoute] string audioId) {
      if (!Guid.TryParse(audioId, out var audioGuid))
        throw new BadRequestException(
          Message: "Could not parse given string into a valid guid.",
          Target: audioId
        );

      var audio = await _database.Audios.FindAsync(audioGuid) ??
        throw new NotFoundException(
          Message: "Could not find audio entry.",
          Target: audioId
        );

      _database.Audios.Remove(audio);
      await _database.SaveChangesAsync();

      await _caching.DeleteCache("audio:all");
      return Ok(new {
        Message = "Audio successfully deleted.",
        Target = audioId
      });
    }

    [HttpGet("q")]
    public async Task<IActionResult> QueryAudios([FromQuery] AudioSearchParams parameters) {
      var key = HttpContext.Request.QueryString.ToString();
      var audios = (await cachingService.GetAsync(CacheGroup, key, () => {
        return audioService.QueryAudios(parameters);
      }))?.Select(AudioView.From).ToList();

      return base.Ok(new {
        Data = audios,
        Count = audios == null ? 0 : audios.Count
      });
    }

    [HttpPatch("{audioId}")]
    public async Task<IActionResult>
      PatchAudio([FromRoute] Guid audioId, [FromBody] PatchAudioRequest request) {
      var operation = await _service.UpdateAudio(audioId, request);
      var audioView = AudioView.From(operation);

      await _caching.DeleteCache("audio:all");
      return base.Ok(audioView);
    }
  }
}
