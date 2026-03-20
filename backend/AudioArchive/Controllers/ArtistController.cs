using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using AudioArchive.Services;
using AudioArchive.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Controllers
{
  [ApiController]
  [Route("api/artist")]
  public class ArtistController(AudioDatabaseContext database, ICachingService _caching) : ControllerBase
  {
    [HttpGet]
    public async Task<IActionResult> GetArtists() {
      var cachingKey = $"getArtist:all";

      var artists = await _caching.GetValueAsync<List<Artist>>(cachingKey);

      if (artists == null) {
        artists = await database.Artists.Include(a => a.Audios).ToListAsync();
        await _caching.SetValueAsync(cachingKey, artists);
      }

      return Ok(new {
        artists.Count,
        Data = artists.Select(a => new {
          a.Id,
          a.Name,
          a.Note,
          a.Reddit,
          a.Twitter,
          AudioCount = a.Audios == null ? 0 : a.Audios.Count
        }).ToList().OrderBy(a => a.Name)
      });
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> GetArtistByName([FromRoute] string name) {
      var artists = await database.Artists
        .Where(t => EF.Functions.ILike(t.Name, $"%{name}%"))
        .ToListAsync();

      return Ok(new {
        artists.Count,
        Data = artists.Select(a => new {
          a.Id,
          a.Name,
          a.Note,
          a.Reddit,
          a.Twitter,
          AudioCount = a.Audios == null ? 0 : a.Audios.Count
        }).ToList().OrderBy(a => a.Name)
      });
    }

    [HttpPost]
    public async Task<IActionResult> PostArtist([FromBody] PostArtistRequest body) {
      var artist = await database.Artists.AddAsync(Artist.From(body));
      await database.SaveChangesAsync();
      return Ok(artist.Entity);
    }

    [HttpPatch("{artistId}")]
    public async Task<IActionResult> PatchArtist(
        [FromRoute] string artistId,
        [FromBody] PatchArtistRequest body) {
      if (!Guid.TryParse(artistId, out var artistGuid)) {
        throw new BadRequestException(
          Message: "Could not parse given string into a valid guid.",
          Target: artistId
        );
      }

      var artist = await database.Artists.FindAsync(artistGuid) ??
        throw new NotFoundException(
          Message: "Could not find artist entry.",
          Target: artistId
        );

      if (body.Name != null) artist.Name = body.Name;
      if (body.Reddit != null) artist.Reddit = body.Reddit;
      if (body.Twitter != null) artist.Twitter = body.Twitter;

      await database.SaveChangesAsync();
      return Ok(artist);
    }
  }
}
