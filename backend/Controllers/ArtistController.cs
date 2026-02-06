using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using AudioArchive.Services;
using AudioArchive.Shared;
using Microsoft.AspNetCore.Http.Extensions;
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
      var requestPath = HttpContext.Request.GetDisplayUrl();
      var cachingKey = $"getArtist:{requestPath}";

      var artists = await _caching.GetValueAsync<List<Artist>>(cachingKey);

      if (artists == null) {
        artists = await database.Artists.ToListAsync();
        await _caching.SetValueAsync(cachingKey, artists);
      }

      return Ok(new {
        artists.Count,
        Data = artists
      });
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> GetArtistByName([FromRoute] string name) {
      var requestPath = HttpContext.Request.GetDisplayUrl();
      var cachingKey = $"getArtistName:{requestPath}";

      var artists = await _caching.GetValueAsync<List<Artist>>(cachingKey);

      if (artists == null) {
        artists = await database.Artists.Where(t => EF.Functions.Like(t.Name, $"%{name}%")).ToListAsync();
        await _caching.SetValueAsync(cachingKey, artists);
      }

      return Ok(new {
        artists.Count,
        Data = artists,
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
        [FromRoute] string artistId, [FromBody] PatchArtistRequest body) {
      if (!Guid.TryParse(artistId, out var id)) return base.BadRequest("Invalid Artist ID");
      var artist = await database.Artists.FindAsync(id) ?? throw new NotFoundException("Artist", artistId);

      if (body.Name != null) artist.Name = body.Name;
      if (body.Reddit != null) artist.Reddit = body.Reddit;
      if (body.Twitter != null) artist.Twitter = body.Twitter;

      await database.SaveChangesAsync();
      return Ok(artist);
    }
  }
}
