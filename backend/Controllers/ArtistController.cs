using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Controllers {
  [ApiController]
  [Route("api/artist")]
  public class ArtistController(AudioDatabaseContext database) : ControllerBase {
    [HttpGet]
    public async Task<IActionResult> GetArtists() {
      var artists = await database.Artists.ToListAsync();
      return Ok(artists);
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> GetArtistByName([FromRoute] string name) {
      var artists = await database.Artists.Where(t => EF.Functions.Like(t.Name, $"%{name}%")).ToListAsync();
      return Ok(artists);
    }

    [HttpPost]
    public async Task<IActionResult> PostArtist([FromBody] ArtistPostRequest body) {
      var artist = Artist.From(body);
      var operation = await database.Artists.AddAsync(artist);
      await database.SaveChangesAsync();
      return Ok(operation.Entity);
    }

    [HttpPatch("{artistId}")]
    public async Task<IActionResult> UpdateArtistInfo([FromRoute] int artistId, [FromBody] ArtistPatchRequest body) {
      var artist = await database.Artists.FindAsync(artistId);
      if (artist == null) return NotFound("Artist not found.");
      if (body.Name != null) artist.Name = body.Name;
      if (body.Reddit != null) artist.Reddit = body.Reddit;
      if (body.Twitter != null) artist.Twitter = body.Twitter;
      await database.SaveChangesAsync();
      return Ok(artist);
    }
  }
}
