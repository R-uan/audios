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
      var existingTags = await database.Tags.Where(t => targetTags.Contains(t.Name)).ToListAsync();
      var newTags = targetTags.Where(t => !existingTags.Exists(tag => tag.Name == t)).Select(t => new Tag {
        Id = Guid.NewGuid(),
        Name = t
      }).ToList();

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
      try {
        var artist = await database.Artists
          .Include(a => a.Audios)
          .Where(a => a.Name == request.Artist)
          .FirstOrDefaultAsync() ?? new Artist {
            Name = request.Artist,
            Id = Guid.NewGuid()
          };

        var audio = Audio.FromRequest(request, artist);

        if (artist.Audios != null && artist.Audios.Any(a => a.Title.Contains(audio.Title))) {
          throw new DuplicatedAudioException(DuplicatedAudio.From(audio));
        }

        if (request.Tags != null) {
          var audioTags = await this.ProcessTags(request.Tags);
          audio.Metadata.Tags = [.. audioTags];
        }

        await database.Audios.AddAsync(audio);
        await database.SaveChangesAsync();
        return audio;
      } catch (Exception) {
        Console.WriteLine("get a real loggin system");
        throw;
      }
    }

    public async Task<BulkStoreAudioResult> BulkStoreAudios(List<PostAudioRequest> requests) {
      List<AudioView> savedAudios = [];
      List<AddAudioFailed> failedAdditions = [];
      List<DuplicatedAudio> duplicatedAudios = [];

      foreach (var request in requests) {
        try {
          var audio = await this.StoreAudio(request);
          savedAudios.Add(AudioView.From(audio));
        } catch (Exception e) {
          if (e is DuplicatedAudioException duplicated) {
            duplicatedAudios.Add(duplicated.Entry);
            continue;
          } else {
            Console.WriteLine("Get a real logger: BulkStoreAudio");
            failedAdditions.Add(AddAudioFailed.From(request));
            continue;
          }

        }
      }

      return new BulkStoreAudioResult {
        SavedAudios = savedAudios,
        FailedAdditions = failedAdditions,
        DuplicatedAudios = duplicatedAudios,
      };
    }

    public async Task<Audio> UpdateAudio(Guid audioId, PatchAudioRequest request) {
      var audio = await database.Audios
        .Include(a => a.Metadata)
          .ThenInclude(m => m.Tags)
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
        var emptyTags = database.Tags
          .Include(t => t.AudioMetadatas)
          .Where(t => t.AudioMetadatas == null || t.AudioMetadatas.Count == 0);
        database.Tags.RemoveRange(emptyTags);
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
