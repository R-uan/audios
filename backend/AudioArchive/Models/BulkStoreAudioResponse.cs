namespace AudioArchive.Models
{
  public class BulkStoreAudioResult
  {
    public required List<AudioView> SavedAudios { get; set; }
    public required List<AddAudioFailed> FailedAdditions { get; set; }
    public required List<DuplicatedAudio> DuplicatedAudios { get; set; }
  }
}
