using AudioCatalog.Models;

namespace AudioCatalog.Services {
  public interface IAudioService {
    Task<AudioView> StoreAudio(PostAudioRequest request);
    Task<List<AudioView>> BulkStoreAudio(List<PostAudioRequest> requests);
  }
}
