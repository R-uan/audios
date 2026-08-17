using AudioArchive.Database.Entity;

namespace AudioArchive.Models.Views
{
  public class AudioMetadataView
  {
    public int? ReleaseYear { get; set; }
    public string? Genre { get; set; }
    public int? Duration { get; set; }

    public List<string>? Tags { get; set; }

    public static AudioMetadataView From(AudioMetadata metadata) {
      return new AudioMetadataView {
        Genre = metadata.Genre,
        Duration = metadata.Duration,
        ReleaseYear = metadata.ReleaseYear,
        Tags = metadata.Tags?.Select(a => a.Name).Order().ToList()
      };
    }
  }
}
