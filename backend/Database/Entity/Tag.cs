using System.Text.Json.Serialization;

namespace AudioCatalog.Database.Entity {
  public class Tag {
    public int Id { get; set; }
    public required string Name { get; set; }
    [JsonIgnore]
    public List<Audio>? Audios { get; set; }
  }
}
