using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Controllers {
  [ApiController]
  [Route("api/playlist")]
  public class PlaylistController(AudioDatabaseContext ctx) : ControllerBase {
    [HttpGet]
    public async Task<IActionResult> GetPlaylists() {
      var playlists = await ctx.Playlists
        .Include(p => p.Audios)
        .Select(p => new {
          p.Id,
          p.Name,
          p.CreatedAt,
          Audios = p.Audios != null ? p.Audios.Select(a => a.Id) : null,
        }).ToListAsync();
      return Ok(playlists);
    }

    [HttpGet("{playlistId}")]
    public async Task<IActionResult> GetPlaylist([FromRoute] Guid playlistId) {
      var playlist = await ctx.Playlists
        .Include(p => p.Audios)
        .Select(p => new {
          p.Id,
          p.Name,
          p.CreatedAt,
          Audios = p.Audios != null ? p.Audios.Select(a => a.Id) : null,
        }).FirstOrDefaultAsync(p => p.Id == playlistId);
      return playlist != null ? base.Ok(playlist) : base.NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreatePlaylist([FromBody] CreatePlaylistRequest request) {
      var transaction = await ctx.Database.BeginTransactionAsync();
      try {
        var playlist = Playlist.FromRequest(request);

        if (request.Audios != null && request.Audios.Count != 0) {
          var validIds = request.Audios.Where(a => a != Guid.Empty);
          var existingAudios = await ctx.Audios.Where(a => validIds.Contains(a.Id)).ToListAsync();
          playlist.Audios = existingAudios;
        }

        var save = await ctx.Playlists.AddAsync(playlist);
        await ctx.SaveChangesAsync();
        await transaction.CommitAsync();

        return base.Ok(new {
          save.Entity.Id,
          save.Entity.Name,
          save.Entity.CreatedAt,
          Audios = save.Entity.Audios?.Select(a => a.Id.ToString())
        });
      } catch {
        await transaction.RollbackAsync();
        throw;
      }
    }

    [HttpPatch("{playlistId}")]
    public async Task<IActionResult> UpdatePlaylist(
        [FromRoute] string playlistId,
        [FromBody] PatchPlaylistRequest request
      ) {
      if (!Guid.TryParse(playlistId, out var guidId)) return base.BadRequest(new { error = "Invalid GUID format" });

      var playlist = await ctx.Playlists.Include(p => p.Audios).FirstOrDefaultAsync(p => p.Id == guidId);
      if (playlist == null) return base.NotFound(new { result = "Playlist was not found." });

      if (!string.IsNullOrEmpty(request.Name)) playlist.Name = request.Name;

      var removedAudios = 0;
      if (request.RemoveAudios?.Count > 0) {
        var validAudioIds = request.RemoveAudios.Where(a => a != Guid.Empty);
        removedAudios = playlist.Audios?.RemoveAll(a => validAudioIds.Contains(a.Id)) ?? 0;
      }

      var addedAudios = 0;
      if (request.AddAudios?.Count > 0) {
        var validAudioIds = request.AddAudios.Where(a => a != Guid.Empty);
        var existingAudios = await ctx.Audios.Where(a => validAudioIds.Contains(a.Id)).ToListAsync();
        (playlist.Audios ??= []).AddRange(existingAudios);
        addedAudios = existingAudios.Count;
      }

      await ctx.SaveChangesAsync();
      return base.Ok(new { addedAudios, removedAudios });
    }
  }
}
