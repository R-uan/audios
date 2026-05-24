using System.Text.Json.Serialization;
using AudioArchive.Models;

namespace AudioArchive.Database.Entity
{
  public class Artist
  {
    public required Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public bool InActivity { get; set; } = true;
    public string? Nationality { get; set; }
    public string? Note { get; set; }

    [JsonIgnore]
    public List<Audio>? Audios { get; set; }
    [JsonIgnore]
    public List<ArtistSocial>? Socials { get; set; }

    public static Artist From(PostArtistRequest request) {
      return new Artist {
        Id = Guid.NewGuid(),
        Name = request.Name,
      };
    }
  }
}
