using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace AudioArchive.Database.Entity
{
  public class Tag
  {
    public required Guid Id { get; set; } = Guid.NewGuid();
    public string? Description { get; set; }
    public required string Name { get; set; }

    [JsonIgnore]
    public List<AudioMetadata>? AudioMetadatas { get; set; }

    [SetsRequiredMembers]
    public Tag(string name) {
      Name = string.Join(" ", name.ToLower().Split(" ").Select(s => char.ToUpper(s[0]) + s[1..]));
    }

    protected Tag() { }
  }
}
