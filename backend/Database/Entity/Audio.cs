using System.Text.Json.Serialization;
using AudioCatalog.Models;

namespace AudioCatalog.Database.Entity {
  public class Audio {
    public int Id { get; set; }
    public required int ArtistId { get; set; }
    public required string Title { get; set; }

    public required string Link { get; set; }
    public required string Source { get; set; }
    public required DateTime AddedAt { get; set; }

    public int Duration { get; set; }

    [JsonIgnore]
    public List<Tag>? Tags { get; set; }
    public required Artist Artist { get; set; }

    public static Audio From(PostAudioRequest request, Artist artist, DateTime now) {
      return new Audio {
        Artist = artist,
        AddedAt = now,
        Duration = request.Duration,
        Link = request.Link,
        Source = request.Source,
        Title = request.Title,
        ArtistId = artist.Id,
      };
    }
  }
}
