using System.Data;
using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using AudioArchive.Shared;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Services
{
  public class AudioService(AudioDatabaseContext database) : IAudioService
  {
    public async Task<List<Tag>> ProcessTags(List<string> targetTags) {
      var lowerTargetTags = targetTags.Select(t => t.ToLower().Trim()).ToList();
      var existingTags = await database.Tags.Where(t => lowerTargetTags.Contains(t.Name.ToLower()))
        .ToListAsync();
      var newTags = lowerTargetTags.Where(t => !existingTags.Exists(tag => tag.Name.ToLower() == t))
        .Select(t => new Tag(t)).ToList();

      if (newTags.Count != 0) {
        await database.Tags.AddRangeAsync(newTags);
        await database.SaveChangesAsync();
        existingTags.AddRange(newTags);
      }

      return existingTags;
    }

    public async Task<Audio> StoreAudio(PostAudioRequest request) {
      // Because EF already wraps the SaveChangesAsync into a transaction 
      // and we only call it once here, the explicitly call is redundant.
      // var transaction = database.Database.BeginTransaction();
      var artist = await database.Artists
        .Include(a => a.Audios)
        .Where(a => a.Name == request.Artist)
        .FirstOrDefaultAsync() ?? new Artist {
          Name = request.Artist,
          Id = Guid.NewGuid()
        };

      var audio = Audio.FromRequest(request, artist);

      if (artist.Audios != null && artist.Audios.Any(a => a.Source.Contains(audio.Source))) {
        throw new DuplicatedAudioException(
          Message: "Attempted to add an already stored audio",
          Target: request.Link ?? request.Source
        );
      }

      if (request.Tags != null) {
        var audioTags = await ProcessTags(request.Tags);
        audio.Metadata.Tags = [.. audioTags];
      }

      await database.Audios.AddAsync(audio);
      await database.SaveChangesAsync();
      return audio;
    }

    public async Task<Audio> UpdateAudio(Guid audioId, PatchAudioRequest request) {
      var audio = await database.Audios
        .Include(a => a.Metadata)
          .ThenInclude(m => m.Tags)
        .Include(a => a.Artist)
        .Where(a => a.Id == audioId)
        .FirstOrDefaultAsync() ??
          throw new NotFoundException(
            Message: "Could not find audio entry.",
            Target: audioId.ToString()
          );

      if (!string.IsNullOrEmpty(request.Title)) audio.Title = request.Title.Trim();
      if (!string.IsNullOrEmpty(request.Link)) audio.Link = request.Link;
      if (!string.IsNullOrEmpty(request.Source)) audio.Source = request.Source;
      if (request.Local.HasValue) audio.Local = request.Local.Value;

      if (!string.IsNullOrEmpty(request.Artist)) {
        var artist = await database.Artists
          .Where(a => a.Name == request.Artist)
          .FirstOrDefaultAsync();

        if (artist == null) {
          artist = new Artist {
            Id = Guid.NewGuid(),
            Name = request.Artist
          };

          await database.Artists.AddAsync(artist);
        }

        audio.Artist = artist;
        audio.ArtistId = artist.Id;
      }

      if (request.Duration.HasValue) audio.Metadata.Duration = request.Duration.Value;
      if (!string.IsNullOrEmpty(request.Genre)) audio.Metadata.Genre = request.Genre.Trim();
      if (request.ReleaseYear.HasValue) audio.Metadata.ReleaseYear = request.ReleaseYear.Value;

      if (request.AddTags != null && request.AddTags.Count > 0) {
        var tags = await ProcessTags(request.AddTags);
        (audio.Metadata.Tags ??= []).AddRange(tags);
      }

      if (request.RemoveTags != null && request.RemoveTags.Count > 0) {
        audio.Metadata.Tags?.RemoveAll(t => request.RemoveTags.Contains(t.Name));
      }

      await database.SaveChangesAsync();
      return audio;
    }

    public async Task<List<Audio>> QueryAudios(AudioSearchParams parameters) {
      var query = database.Audios
          .Include(a => a.Artist)
          .Include(a => a.Metadata)
              .ThenInclude(m => m.Tags)
          .AsQueryable();

      if (!string.IsNullOrEmpty(parameters.Artist))
        query = query.Where(a => EF.Functions.ILike(a.Artist.Name, $"%{parameters.Artist}%"));

      if (!string.IsNullOrEmpty(parameters.Title))
        query = query.Where(a => EF.Functions.ILike(a.Title, $"%{parameters.Title}%"));

      if (!string.IsNullOrEmpty(parameters.IncludeTags)) {
        foreach (var tag in parameters.IncludeTags.Split(",")) {
          var captured = tag;
          query = query.Where(a => a.Metadata.Tags.Any(t => t.Name == captured));
        }
      }

      if (!string.IsNullOrEmpty(parameters.ExcludeTags)) {
        foreach (var tag in parameters.ExcludeTags.Split(",")) {
          var captured = tag;
          query = query.Where(a => !a.Metadata.Tags.Any(t => t.Name == captured));
        }
      }

      if (parameters.MinDuration > 0)
        query = query.Where(a => a.Metadata.Duration >= parameters.MinDuration);

      if (parameters.MaxDuration > 0)
        query = query.Where(a => a.Metadata.Duration <= parameters.MaxDuration);

      return await query.ToListAsync();
    }
  }
}
