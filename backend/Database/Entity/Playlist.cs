using AudioCatalog.Models;

namespace AudioCatalog.Database.Entity {
  public class Playlist {
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<Audio>? Audios { get; set; }

    public static Playlist FromRequest(CreatePlaylistRequest request) {
      return new Playlist {
        Id = Guid.NewGuid(),
        Name = request.Name,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
      };
    }
  }
}
