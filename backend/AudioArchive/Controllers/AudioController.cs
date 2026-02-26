using AudioArchive.Models;
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

    /* Get All Audios
     * Look for cached value and returns it else
     * fetches values from the database and cache it.
     */
    [HttpGet]
    public async Task<IActionResult> GetAudios() {
      var cachingKey = $"get_audio:all";
      var audios = await _caching.GetValueAsync<List<AudioView>>(cachingKey);

      if (audios == null) {
        audios = await _database.Audios.Select(audio => new AudioView {
          Id = audio.Id,
          Title = audio.Title,
          Artist = audio.Artist.Name,
          Source = audio.Source,
          Link = audio.Link,
          AddedAt = audio.AddedAt,
          Metadata = new AudioMetadataView {
            Duration = audio.Metadata.Duration,
            Genrer = audio.Metadata.Genrer,
            Mood = audio.Metadata.Mood,
            ReleaseYear = audio.Metadata.ReleaseYear,
            Tags = audio.Metadata.Tags.Select(t => t.Name).Order().ToList(),
          }
        }).OrderBy(a => a.Title).ToListAsync();

        await _caching.SetValueAsync(cachingKey, audios);
      }

      return Ok(new {
        audios.Count,
        Data = audios,
      });
    }

    /* Get Available Audio Tags
     * No fetching because the count is small
     */
    [HttpGet("tags")]
    public async Task<IActionResult> GetAudioTags() {
      var tags = await _database.Tags.Select(t => t.Name).ToListAsync();
      return base.Ok(tags);
    }

    /* Get one Audio by Id
     * No Caching
     */
    [HttpGet("{audioId}")]
    public async Task<IActionResult> GetAudio([FromRoute] string audioId) {
      if (Guid.TryParse(audioId, out var id)) return base.BadRequest();
      var audio = await _database.Audios.Include(a => a.Artist)
      .Include(a => a.Metadata).ThenInclude(m => m.Tags)
      .Where(a => a.Id == id).FirstOrDefaultAsync()
      ?? throw new NotFoundException("Audio", audioId);
      return base.Ok(AudioView.From(audio));
    }

    [HttpPost]
    public async Task<IActionResult> PostAudio([FromBody] PostAudioRequest request) {
      var audio = await _service.StoreAudio(request);
      return base.Ok(AudioView.From(audio));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> PostMultipleAudios([FromBody] List<PostAudioRequest> request) {
      var result = await _service.BulkStoreAudios(request);
      return base.Ok(result);
    }

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
      var requestPath = HttpContext.Request.GetDisplayUrl();
      var cachingKey = $"queryAudio:{requestPath}";
      var audios = await _caching.GetValueAsync<List<Audio>>(cachingKey);

      if (audios == null) {
        audios = await _service.QueryAudios(parameters);
        await _caching.SetValueAsync(cachingKey, audios);
      }

      var audiosView = audios.Select(AudioView.From).ToList();
      return base.Ok(new {
        audiosView.Count,
        Data = audiosView
      });
    }

    [HttpPatch("{audioId}")]
    public async Task<IActionResult>
      PatchAudio([FromRoute] Guid audioId, [FromBody] PatchAudioRequest request) {
      var cachingKey = "get_audio:all";
      var operation = await _service.UpdateAudio(audioId, request);
      var audioView = AudioView.From(operation);
      await _caching.DeleteCache(cachingKey);
      return base.Ok(audioView);
    }
  }
}
