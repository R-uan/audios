using AudioArchive.Database;
using AudioArchive.Models;
using AudioArchive.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Services
{
  public class ArtistService(DatabaseContext database) : IArtistService
  {
    public async Task<ArtistProfileView> ArtistProfile(Guid artistId) {
      return await database.Artists
          .Where(a => a.Id == artistId)
          .Select(artist => new ArtistProfileView {
            Name = artist.Name,
            AudioCount = artist.Audios == null ? 0 : artist.Audios.Count(),
            Nationality = artist.Nationality,
            InActivity = artist.InActivity,
            Note = artist.Note,
            MostFrequentTags = artist.Audios == null ? null :
              artist.Audios.SelectMany(audio => audio.Metadata.Tags)
              .GroupBy(tag => tag.Name)
              .OrderByDescending(group => group.Count())
              .Take(3)
              .Select(group => new TagFrequency(group.Key, group.Count()))
              .ToList()
          }).FirstAsync();
    }

    public async Task<ArtistProfileView> ArtistProfileByNameAync(string name) {
      return await database.Artists.Select(artist => new ArtistProfileView {
        Name = artist.Name,
        AudioCount = artist.Audios == null ? 0 : artist.Audios.Count(),
        Nationality = artist.Nationality,
        InActivity = artist.InActivity,
        Note = artist.Note,
        MostFrequentTags = artist.Audios == null ? null :
          artist.Audios.SelectMany(audio => audio.Metadata.Tags)
          .GroupBy(tag => tag.Name)
          .OrderByDescending(group => group.Count())
          .Take(3)
          .Select(group => new TagFrequency(group.Key, group.Count()))
          .ToList()
      }).Where(a => a.Name == name).FirstAsync();
    }

    public async Task<List<ArtistProfileView>> ArtistProfiles() {
      return await database.Artists.Select(artist => new ArtistProfileView {
        Name = artist.Name,
        AudioCount = artist.Audios == null ? 0 : artist.Audios.Count(),
        Nationality = artist.Nationality,
        InActivity = artist.InActivity,
        Note = artist.Note,
        MostFrequentTags = artist.Audios == null ? null :
          artist.Audios.SelectMany(audio => audio.Metadata.Tags)
          .GroupBy(tag => tag.Name)
          .OrderByDescending(group => group.Count())
          .Take(3)
          .Select(group => new TagFrequency(group.Key, group.Count()))
          .ToList()
      }).ToListAsync();
    }

    public async Task<ArtistProfileView> UpdateArtist(Guid artistId, PatchArtistRequest request) {
      var artist = await database.Artists.Where(a => a.Id == artistId).FirstAsync();
      if (!string.IsNullOrEmpty(request.Name)) artist.Name = request.Name;
      if (!string.IsNullOrEmpty(request.Nationality)) artist.Nationality = request.Nationality;
      if (!string.IsNullOrEmpty(request.Note)) artist.Note = request.Note;
      if (request.InActivity != null) request.InActivity = request.InActivity;
      await database.SaveChangesAsync();
      return ArtistProfileView.From(artist);
    }
  }
}
