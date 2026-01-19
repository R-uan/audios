using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using AudioArchive.Shared;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Services {
  public class AudioService(AudioDatabaseContext ctx_) : IAudioService {
    public async Task<PartialAudioView> StoreAudio(PostAudioRequest request) {
      var transaction = ctx_.Database.BeginTransaction();
      try {
        var artist = await ctx_.Artists.Where(a => a.Name == request.Artist).FirstOrDefaultAsync() ??
          new Artist { Name = request.Artist, Id = Guid.NewGuid() };
        var audio = Audio.FromRequest(request, artist);

        if (request.Tags != null) {
          var existingTags = await ctx_.Tags.Where(t => request.Tags.Contains(t.Name))
            .ToDictionaryAsync(t => t.Name);

          var newTags = request.Tags.Where(tag => !existingTags.ContainsKey(tag))
            .Select(tag => new Tag { Id = Guid.NewGuid(), Name = tag }).ToList();

          if (newTags.Count != 0) {
            await ctx_.Tags.AddRangeAsync(newTags);
            await ctx_.SaveChangesAsync();
            foreach (var tag in newTags) {
              existingTags[tag.Name] = tag;
            }
          }

          audio.Metadata.Tags = [.. request.Tags.Select(t => existingTags[t])];
        }

        await ctx_.Audios.AddAsync(audio);
        await ctx_.SaveChangesAsync();
        await transaction.CommitAsync();
        return PartialAudioView.FromAudio(audio);
      } catch (Exception) {
        Console.WriteLine("get a real loggin system");
        await transaction.RollbackAsync();
        throw;
      }
    }

    public async Task<List<PartialAudioView>> BulkStoreAudio(List<PostAudioRequest> requests) {
      var transaction = ctx_.Database.BeginTransaction();
      try {
        var artistNames = requests.Select(a => a.Artist).Distinct().ToList();
        var tagNames = requests.Where(a => a.Tags != null).SelectMany(a => a.Tags!).Distinct().ToList();

        var existingArtists = await ctx_.Artists
          .Where(a => artistNames.Contains(a.Name))
          .ToDictionaryAsync(a => a.Name);

        // Add new artists (minimal information)
        var newArtists = artistNames.Where(name => !existingArtists.ContainsKey(name))
          .Select(name => new Artist { Name = name, Id = Guid.NewGuid() }).ToList();

        if (newArtists.Count != 0) {
          await ctx_.Artists.AddRangeAsync(newArtists);
          await ctx_.SaveChangesAsync();
          foreach (var artist in newArtists) {
            existingArtists[artist.Name] = artist;
          }
        }

        // Add new tags
        var existingTags = await ctx_.Tags
          .Where(t => tagNames.Contains(t.Name))
          .ToDictionaryAsync(t => t.Name);

        var newTags = tagNames.Where(tag => !existingTags.ContainsKey(tag))
          .Select(tag => new Tag { Id = Guid.NewGuid(), Name = tag }).ToList();

        if (newTags.Count != 0) {
          await ctx_.Tags.AddRangeAsync(newTags);
          await ctx_.SaveChangesAsync();
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

        await ctx_.Audios.AddRangeAsync(audios);
        await ctx_.SaveChangesAsync();
        await transaction.CommitAsync();

        return [.. audios.Select(PartialAudioView.FromAudio)];
      } catch (Exception) {
        Console.WriteLine("get a real logger");
        throw;
      }
    }
  }
}
