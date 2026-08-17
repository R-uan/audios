using AudioArchive.Models;
using AudioArchive.Models.Views;

namespace AudioArchive.Services
{
  public interface IArtistService
  {
    public Task<List<ArtistProfileView>> ArtistProfiles();
    public Task<ArtistProfileView> ArtistProfile(Guid artistId);
    public Task<ArtistProfileView> ArtistProfileByNameAync(string name);
    public Task<ArtistProfileView> UpdateArtist(Guid artistId, PatchArtistRequest request);
  }
}
