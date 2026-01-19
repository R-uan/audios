using System.Text.Json.Serialization;
using AudioArchive.Models;

namespace AudioArchive.Database.Entity {
  public class Audio {
    public required Guid Id { get; set; } = Guid.NewGuid();
    public required Guid ArtistId { get; set; }
    public required string Title { get; set; }

    public string? Link { get; set; }
    public required bool Local { get; set; }
    // If the media is stored locally or not
    public required string Source { get; set; }

    public required Artist Artist { get; set; }
    public required DateTime AddedAt { get; set; }


    [JsonIgnore]
    public List<Playlist>? Playlists { get; set; }
    public required AudioMetadata Metadata { get; set; }

    public static Audio FromRequest(PostAudioRequest request, Artist artist) {
      var audioId = Guid.NewGuid();

      var metadata = new AudioMetadata {
        Id = Guid.NewGuid(),
        Duration = request.Duration,
        AudioId = audioId,
        Genrer = request.Genrer,
        Mood = request.Mood,
        ReleaseYear = request.ReleaseYear,
      };

      var audio = new Audio {
        Id = audioId,
        Artist = artist,
        AddedAt = DateTime.UtcNow,
        Local = false,
        Link = request.Link,
        Source = request.Source,
        Title = request.Title,
        ArtistId = artist.Id,
        Metadata = metadata
      };

      return audio;
    }
  }
}
