using AudioArchive.Models.Views;

namespace AudioArchive.Models
{
  public class StoreMultipleAudioResponse
  {
    public required List<AudioView> SavedAudios { get; set; }
    public required List<string> FailedAdditions { get; set; }
    public required List<string> DuplicatedAudios { get; set; }
  }
}
