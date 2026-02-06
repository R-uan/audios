using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using AudioArchive.Shared;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Services {
  public class AudioService(AudioDatabaseContext database) : IAudioService {
    public async Task<PartialAudioView> StoreAudio(PostAudioRequest request) {
      var transaction = database.Database.BeginTransaction();
      try {
        var artist = await database.Artists.Where(a => a.Name == request.Artist).FirstOrDefaultAsync() ??
          new Artist { Name = request.Artist, Id = Guid.NewGuid() };
        var audio = Audio.FromRequest(request, artist);

        if (request.Tags != null) {
          var existingTags = await database.Tags.Where(t => request.Tags.Contains(t.Name))
            .ToDictionaryAsync(t => t.Name);

          var newTags = request.Tags.Where(tag => !existingTags.ContainsKey(tag))
            .Select(tag => new Tag { Id = Guid.NewGuid(), Name = tag }).ToList();

          if (newTags.Count != 0) {
            await database.Tags.AddRangeAsync(newTags);
            await database.SaveChangesAsync();
            foreach (var tag in newTags) {
              existingTags[tag.Name] = tag;
            }
          }

          audio.Metadata.Tags = [.. request.Tags.Select(t => existingTags[t])];
        }

        await database.Audios.AddAsync(audio);
        await database.SaveChangesAsync();
        await transaction.CommitAsync();
        return PartialAudioView.FromAudio(audio);
      } catch (Exception) {
        Console.WriteLine("get a real loggin system");
        await transaction.RollbackAsync();
        throw;
      }
    }

    public async Task<List<PartialAudioView>> BulkStoreAudio(List<PostAudioRequest> requests) {
      var transaction = database.Database.BeginTransaction();
      try {
        var artistNames = requests.Select(a => a.Artist).Distinct().ToList();
        var tagNames = requests.Where(a => a.Tags != null).SelectMany(a => a.Tags!).Distinct().ToList();

        var existingArtists = await database.Artists
          .Where(a => artistNames.Contains(a.Name))
          .ToDictionaryAsync(a => a.Name);

        // Add new artists (minimal information)
        var newArtists = artistNames.Where(name => !existingArtists.ContainsKey(name))
          .Select(name => new Artist { Name = name, Id = Guid.NewGuid() }).ToList();

        if (newArtists.Count != 0) {
          await database.Artists.AddRangeAsync(newArtists);
          await database.SaveChangesAsync();
          foreach (var artist in newArtists) {
            existingArtists[artist.Name] = artist;
          }
        }

        // Add new tags
        var existingTags = await database.Tags
          .Where(t => tagNames.Contains(t.Name))
          .ToDictionaryAsync(t => t.Name);

        var newTags = tagNames.Where(tag => !existingTags.ContainsKey(tag))
          .Select(tag => new Tag { Id = Guid.NewGuid(), Name = tag }).ToList();

        if (newTags.Count != 0) {
          await database.Tags.AddRangeAsync(newTags);
          await database.SaveChangesAsync();
          foreach (var tag in newTags) {
            existingTags[tag.Name] = tag;
          }
        }

        var audios = requests.Select(audio => {
          var artist = existingArtists[audio.Artist];
          var audioEntity = Audio.FromRequest(audio, artist);
          if (audio.Tags != null) {
            audioEntity.Metadata.Tags = [.. audio.Tags.Select(tagName => existingTags[tagName])];
          }
          return audioEntity;
        }).ToList();

        await database.Audios.AddRangeAsync(audios);
        await database.SaveChangesAsync();
        await transaction.CommitAsync();

        return [.. audios.Select(PartialAudioView.FromAudio)];
      } catch (Exception) {
        Console.WriteLine("get a real logger");
        throw;
      }
    }

    public async Task<PartialAudioView> UpdateAudio(Guid audioId, PatchAudioRequest request) {
      var audio = await database.Audios
        .Include(a => a.Metadata)
        .Include(a => a.Artist)
        .Where(a => a.Id == audioId)
        .FirstOrDefaultAsync() ??
        throw new NotFoundException("Audio", audioId.ToString());

      if (!string.IsNullOrEmpty(request.Title)) audio.Title = request.Title;
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

      // Metadata
      // Missing tags
      if (!string.IsNullOrEmpty(request.Mood)) audio.Metadata.Mood = request.Mood;
      if (request.Duration.HasValue) audio.Metadata.Duration = request.Duration.Value;
      if (!string.IsNullOrEmpty(request.Genrer)) audio.Metadata.Genrer = request.Genrer;
      if (request.ReleaseYear.HasValue) audio.Metadata.ReleaseYear = request.ReleaseYear.Value;

      if (request.AddTags != null && request.AddTags.Count > 0) {
        var tags = await database.Tags
          .Where(t => request.AddTags.Contains(t.Name))
          .ToDictionaryAsync(t => t.Name);

        var newTags = request.AddTags
          .Where(t => !tags.ContainsKey(t))
          .Select(t => new Tag { Name = t, Id = Guid.NewGuid() })
          .ToList();

        if (newTags.Count > 0) {
          await database.Tags.AddRangeAsync(newTags);
          foreach (var tag in newTags) {
            tags.Add(tag.Name, tag);
          }
        }

        if (tags.Count > 0 && request.AddTags.Count > 0) {
          (audio.Metadata.Tags ??= []).AddRange(request.AddTags.Select(t => tags[t]));
        }
      }

      if (request.RemoveTags != null && request.RemoveTags.Count > 0) {
        audio.Metadata.Tags?.RemoveAll(t => request.RemoveTags.Contains(t.Name));
      }

      await database.SaveChangesAsync();
      return PartialAudioView.FromAudio(audio);
    }

    public async Task<List<PartialAudioView>> QueryAudios(AudioSearchParams parameters) {
      var query = database.Audios.AsQueryable();
      if (!string.IsNullOrEmpty(parameters.Artist))
        query = query.Where(a => EF.Functions.ILike(a.Artist.Name, $"%{parameters.Artist}%"));

      if (!string.IsNullOrEmpty(parameters.Title))
        query = query.Where(a => EF.Functions.ILike(a.Title, $"%{parameters.Title}%"));

      if (parameters.Tags != null) {
        foreach (var tag in parameters.Tags)
          query = query.Where(a => a.Metadata.Tags != null && a.Metadata.Tags.Any(t => t.Name == tag));
      }

      if (parameters.MinDuration > 0)
        query = query.Where(a => a.Metadata.Tags != null && a.Metadata.Duration >= parameters.MinDuration);

      if (parameters.MaxDuration > 0) {
        query = query.Where(a => a.Metadata.Duration != null && a.Metadata.Duration <= parameters.MaxDuration);
      }

      return await query.Select(audio => new PartialAudioView {
        Id = audio.Id,
        Title = audio.Title,
        Artist = audio.Artist.Name,
        Source = audio.Source,
        Link = audio.Link,
        AddedAt = audio.AddedAt,
        Duration = audio.Metadata != null ? audio.Metadata.Duration : 0
      }).ToListAsync();
    }
  }
}
