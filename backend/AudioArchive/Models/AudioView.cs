using AudioArchive.Database.Entity;

namespace AudioArchive.Models
{
  public class AudioView
  {
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Artist { get; set; }

    public string? Link { get; set; }
    public required string Source { get; set; }
    public required DateTime AddedAt { get; set; }
    public required AudioMetadataView Metadata { get; set; }

    public static AudioView From(Audio audio) {
      return new AudioView {
        Id = audio.Id,
        Title = audio.Title,
        Artist = audio.Artist?.Name ?? "Unknown",  // ?. instead of just .
        Source = audio.Source,
        Link = audio.Link,
        AddedAt = audio.AddedAt,
        Metadata = AudioMetadataView.From(audio.Metadata)
      };
    }
  }
}
