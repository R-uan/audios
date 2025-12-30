using AudioCatalog.Database;
using AudioCatalog.Database.Entity;
using AudioCatalog.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioCatalog.Controllers {
  [ApiController]
  [Route("api/audio")]
  public class AudioController(AudioDatabaseContext database) : ControllerBase {
    [HttpGet]
    public async Task<IActionResult> GetAudios() {
      var audios = await database.Audios.Select(a => new AudioView {
        Artist = a.Artist.Name,
        Id = a.Id,
        Duration = a.Duration,
        AddedAt = a.AddedAt,
        Link = a.Link,
        Source = a.Source,
        Title = a.Title
      }).ToListAsync();
      return Ok(audios);
    }

    [HttpPost]
    public async Task<IActionResult> PostAudio([FromBody] List<PostAudioRequest> body) {
      var transaction = await database.Database.BeginTransactionAsync();
      try {
        var now = DateTime.UtcNow;
        var artistNames = body.Select(a => a.Artist).Distinct().ToList();
        var tagNames = body.Where(a => a.Tags != null)
          .SelectMany(a => a.Tags!).Distinct().ToList();

        var existingArtists = await database.Artists
          .Where(a => artistNames.Contains(a.Name))
          .ToDictionaryAsync(t => t.Name);

        var existingTags = await database.Tags
          .Where(t => tagNames.Contains(t.Name))
          .ToDictionaryAsync(t => t.Name);

        var newArtists = artistNames.Where(name => !existingArtists.ContainsKey(name))
          .Select(name => new Artist { Name = name }).ToList();

        if (newArtists.Count != 0) {
          await database.Artists.AddRangeAsync(newArtists);
          await database.SaveChangesAsync();
          foreach (var artist in newArtists) {
            existingArtists[artist.Name] = artist;
          }
        }

        var newTags = tagNames.Where(tag => !existingTags.ContainsKey(tag))
          .Select(tag => new Tag { Name = tag }).ToList();

        if (newTags.Count != 0) {
          await database.Tags.AddRangeAsync(newTags);
          await database.SaveChangesAsync();
          foreach (var tag in newTags) {
            existingTags[tag.Name] = tag;
          }
        }

        var audios = body.Select(audio => {
          var artist = existingArtists[audio.Artist];
          var audioEntity = Audio.From(audio, artist, now);

          if (audio.Tags != null) {
            audioEntity.Tags = [.. audio.Tags.Select(tagName => existingTags[tagName])];
          }
          return audioEntity;
        }).ToList();

        await database.Audios.AddRangeAsync(audios);
        await database.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(audios);
      } catch (Exception ex) {
        Console.WriteLine(ex.Message);
        await transaction.RollbackAsync();
        return StatusCode(500);
      }
    }

    [HttpDelete("{audioId}")]
    public async Task<IActionResult> DeleteAudio([FromRoute] int audioId) {
      var audio = await database.Audios.FindAsync(audioId);
      if (audio == null) return NotFound($"Audio not found {audioId}");
      database.Audios.Remove(audio);
      await database.SaveChangesAsync();
      return Ok();
    }

    [HttpGet("q")]
    public async Task<IActionResult> QueryAudios([FromQuery] AudioSearchParams parameters) {
      var query = database.Audios.AsQueryable();
      if (!string.IsNullOrEmpty(parameters.Artist)) {
        query = query.Where(a => EF.Functions.ILike(a.Artist.Name, $"%{parameters.Artist}%"));
      }

      if (!string.IsNullOrEmpty(parameters.Title)) {
        query = query.Where(a => EF.Functions.ILike(a.Title, $"%{parameters.Title}%"));
      }

      if (parameters.Tags != null) {
        foreach (var tag in parameters.Tags) {
          query = query.Where(a => a.Tags != null && a.Tags.Any(t => t.Name == tag));
        }
      }

      if (parameters.MinDuration > 0) {
        query = query.Where(a => a.Duration >= parameters.MinDuration);
      }

      if (parameters.MaxDuration > 0) {
        query = query.Where(a => a.Duration <= parameters.MaxDuration);
      }

      var audios = await query.Select(a => new AudioView {
        Artist = a.Artist.Name,
        Id = a.Id,
        Duration = a.Duration,
        AddedAt = a.AddedAt,
        Link = a.Link,
        Source = a.Source,
        Title = a.Title
      }).ToListAsync();

      return Ok(audios);
    }
  }
}
