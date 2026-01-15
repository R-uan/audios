using AudioCatalog.Models;

namespace AudioCatalog.Database.Entity {
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
    public AudioMetadata? Metadata { get; set; }
    public List<Playlist>? Playlists { get; set; }

    public static Audio FromRequest(PostAudioRequest request, Artist artist) {
      var audioId = Guid.NewGuid();
      var audio = new Audio {
        Id = audioId,
        Artist = artist,
        AddedAt = DateTime.UtcNow,
        Local = false,
        Link = request.Link,
        Source = request.Source,
        Title = request.Title,
        ArtistId = artist.Id,
      };

      audio.Metadata = new AudioMetadata {
        Id = Guid.NewGuid(),
        Duration = request.Duration,
        AudioId = audioId,
        Genrer = request.Genrer,
        Mood = request.Mood,
        ReleaseYear = request.ReleaseYear,
        Audio = audio
      };
      return audio;
    }
  }
}
