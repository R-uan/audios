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
  public class ArtistController : ControllerBase
  {
    private readonly string CacheGroup = "artist";
    private readonly DatabaseContext databaseContext;
    private readonly ICachingService cachingService;
    private readonly IArtistService artistService;

    public ArtistController(DatabaseContext ctx, ICachingService caching, IArtistService artist) {
      this.databaseContext = ctx;
      this.cachingService = caching;
      this.artistService = artist;
    }

    [HttpGet]
    public async Task<IActionResult> GetArtists() {
      var artists = await cachingService.GetAsync(CacheGroup, "all", () => {
        return databaseContext.Artists.Include(a => a.Audios).ToListAsync();
      });

      return Ok(new {
        Count = artists == null ? 0 : artists.Count,
        Data = artists?.Select(a => new {
          a.Id,
          a.Name,
          a.Note,
          AudioCount = a.Audios == null ? 0 : a.Audios.Count
        }).ToList().OrderBy(a => a.Name)
      });
    }

    [HttpGet("profiles")]
    public async Task<IActionResult> GetProfiles() {
      var profiles = await cachingService.GetAsync(CacheGroup, "profiles", () => {
        return artistService.ArtistProfiles();
      });

      return Ok(profiles);
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> GetArtistByName([FromRoute] string name) {
      return Ok(await artistService.ArtistProfileByNameAync(name));
    }

    [HttpPost]
    public async Task<IActionResult> PostArtist([FromBody] PostArtistRequest body) {
      var artist = await databaseContext.Artists.AddAsync(Artist.From(body));
      await databaseContext.SaveChangesAsync();
      return Ok(artist.Entity);
    }

    [HttpPatch("{artistId}")]
    public async Task<IActionResult> PatchArtist([FromRoute] string artistId, [FromBody] PatchArtistRequest body) {
      if (!Guid.TryParse(artistId, out var artistGuid)) {
        throw new BadRequestException(
          Message: "Could not parse given string into a valid guid.",
          Target: artistId
        );
      }
      var operation = await artistService.UpdateArtist(artistGuid, body);
      return Ok(operation);
    }

    [HttpDelete("{artistId}")]
    public async Task<IActionResult> DeleteArtist([FromRoute] string artistId) {
      if (!Guid.TryParse(artistId, out var artistGuid)) {
        throw new BadRequestException(
          Message: "Could not parse given string into a valid guid.",
          Target: artistId
        );
      }

      var artist = await databaseContext.Artists.FindAsync(artistGuid) ??
        throw new NotFoundException(
          Message: "Could not find artist entry.",
          Target: artistId
        );

      databaseContext.Remove(artist);
      await databaseContext.SaveChangesAsync();

      return base.Ok(new {
        Message = "Artist successfully deleted.",
        Target = artistId
      });
    }
  }
}
