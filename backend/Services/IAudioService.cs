using AudioArchive.Models;

namespace AudioArchive.Services {
  public interface IAudioService {
    Task<PartialAudioView> StoreAudio(PostAudioRequest request);
    Task<PartialAudioView> UpdateAudio(Guid id, PatchAudioRequest request);
    Task<List<PartialAudioView>> BulkStoreAudio(List<PostAudioRequest> requests);
  }
}
