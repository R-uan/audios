using System.Text.Json.Serialization;

namespace AudioArchive.Database.Entity {
  public class AudioMetadata {
    public required Guid Id { get; set; }
    public required Guid AudioId { get; set; }
    public int? ReleaseYear { get; set; }
    public string? Genrer { get; set; }
    public int? Duration { get; set; }
    public string? Mood { get; set; }

    public List<Tag>? Tags { get; set; }

    [JsonIgnore]
    public Audio? Audio { get; set; }
  }
}
