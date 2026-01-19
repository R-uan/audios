using AudioArchive.Database.Entity;

namespace AudioArchive.Models {
  public class PartialAudioView {
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Artist { get; set; }
    public int? Duration { get; set; }

    public string? Link { get; set; }
    public required string Source { get; set; }
    public required DateTime AddedAt { get; set; }

    public static PartialAudioView FromAudio(Audio audio) {
      return new PartialAudioView() {
        Id = audio.Id,
        Title = audio.Title,
        Artist = audio.Artist.Name ?? "Unknown",
        Source = audio.Source,
        Link = audio.Link,
        AddedAt = audio.AddedAt,
        Duration = audio.Metadata?.Duration
      };
    }
  }

  public class FullAudioView {
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Artist { get; set; }

    public string? Link { get; set; }
    public required string Source { get; set; }
    public required DateTime AddedAt { get; set; }
    public required AudioMetadataView Metadata { get; set; }

    public static FullAudioView FromAudio(Audio audio) {
      return new FullAudioView() {
        Id = audio.Id,
        Title = audio.Title,
        Artist = audio.Artist.Name ?? "Unknown",
        Source = audio.Source,
        Link = audio.Link,
        AddedAt = audio.AddedAt,
        Metadata = AudioMetadataView.From(audio.Metadata)
      };
    }
  }
}
