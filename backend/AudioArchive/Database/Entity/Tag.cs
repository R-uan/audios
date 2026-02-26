using System.Text.Json.Serialization;

namespace AudioArchive.Database.Entity {
  public class Tag {
    public required Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }

    [JsonIgnore]
    public List<AudioMetadata>? AudioMetadatas { get; set; }
  }
}
