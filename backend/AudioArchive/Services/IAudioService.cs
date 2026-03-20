using AudioArchive.Database.Entity;
using AudioArchive.Models;

namespace AudioArchive.Services
{
  public interface IAudioService
  {
    Task<Audio> StoreAudio(PostAudioRequest request);
    Task<List<Tag>> ProcessTags(List<string> targetTags);
    Task<Audio> UpdateAudio(Guid id, PatchAudioRequest request);
    Task<List<Audio>> QueryAudios(AudioSearchParams parameters);
  }
}
