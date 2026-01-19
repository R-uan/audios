using System.Text.Json.Serialization;
using AudioArchive.Models;

namespace AudioArchive.Database.Entity {
  public class Artist {
    public required Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public string? Reddit { get; set; }
    public string? Twitter { get; set; }
    [JsonIgnore]
    public List<Audio>? Audios { get; set; }

    public static Artist From(ArtistPostRequest request) {
      return new Artist {
        Id = Guid.NewGuid(),
        Name = request.Name,
        Reddit = request.Reddit,
        Twitter = request.Twitter,
      };
    }
  }
}
