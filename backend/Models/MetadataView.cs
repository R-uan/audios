using AudioArchive.Database.Entity;

namespace AudioArchive.Models {
  public class AudioMetadataView {
    public required Guid Id { get; set; }
    public required Guid AudioId { get; set; }
    public int? ReleaseYear { get; set; }
    public string? Genrer { get; set; }
    public int? Duration { get; set; }
    public string? Mood { get; set; }

    public List<string>? Tags { get; set; }

    public static AudioMetadataView From(AudioMetadata metadata) {
      return new AudioMetadataView {
        Id = metadata.Id,
        AudioId = metadata.AudioId,
        Genrer = metadata.Genrer,
        Duration = metadata.Duration,
        Mood = metadata.Mood,
        ReleaseYear = metadata.ReleaseYear,
        Tags = metadata.Tags?.Select(a => a.Name).ToList()
      };
    }
  }
}
