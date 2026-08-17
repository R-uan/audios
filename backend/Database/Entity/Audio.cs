using System.Text.Json.Serialization;
using AudioArchive.Models;

namespace AudioArchive.Database.Entity
{
  public class Audio
  {
    public required Guid Id { get; set; } = Guid.NewGuid();
    public required Guid ArtistId { get; set; }
    public required string Title { get; set; }
    // The differente between link and source is that the link may be an url to a provider
    // where the sound is stored or detailed, while source is a direct url to the media.
    // Links are usually null on local storage as they have no such page.
    public string? Link { get; set; } 
    public required bool Local { get; set; } // If the source is a path or a link
    public required string Source { get; set; }

    public required Artist Artist { get; set; }
    public required DateTime AddedAt { get; set; }
    public DateTime? UpdatedAt { get; set; } = null;
    public required AudioMetadata Metadata { get; set; }

    [JsonIgnore]
    public List<Playlist>? Playlists { get; set; }

    public static Audio FromRequest(PostAudioRequest request, Artist artist) {
      var audioId = Guid.NewGuid();

      var metadata = new AudioMetadata {
        Id = Guid.NewGuid(),
        Duration = request.Duration,
        AudioId = audioId,
        Genre = request.Genre,
        ReleaseYear = request.ReleaseYear,
        Tags = []
      };

      var audio = new Audio {
        Id = audioId,
        Artist = artist,
        AddedAt = DateTime.UtcNow,
        Local = request.Local,
        Link = request.Link,
        Source = request.Source,
        Title = request.Title.Trim(),
        ArtistId = artist.Id,
        Metadata = metadata
      };

      return audio;
    }
  }
}
