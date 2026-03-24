using AudioArchive.Database.Entity;

namespace AudioArchive.Models.Views
{
  public class AudioMetadataView
  {
    public int? ReleaseYear { get; set; }
    public string? Genrer { get; set; }
    public int? Duration { get; set; }
    public string? Mood { get; set; }

    public List<string>? Tags { get; set; }

    public static AudioMetadataView From(AudioMetadata metadata) {
      return new AudioMetadataView {
        Genrer = metadata.Genrer,
        Duration = metadata.Duration,
        Mood = metadata.Mood,
        ReleaseYear = metadata.ReleaseYear,
        Tags = metadata.Tags?.Select(a => a.Name).Order().ToList()
      };
    }
  }
}
