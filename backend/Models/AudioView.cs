using AudioCatalog.Database.Entity;

namespace AudioCatalog.Models {
  public class AudioView {
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Artist { get; set; }
    public int? Duration { get; set; }

    public string? Link { get; set; }
    public required string Source { get; set; }
    public required DateTime AddedAt { get; set; }

    public static AudioView FromAudio(Audio audio) {
      return new AudioView() {
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
}
