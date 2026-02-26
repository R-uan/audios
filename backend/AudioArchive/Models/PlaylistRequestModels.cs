namespace AudioArchive.Models
{
  public class CreatePlaylistRequest
  {
    public required string Name { get; set; }
    public List<Guid>? Audios { get; set; }
  }

  public class CreateSGPlaylistRequest
  {
    public required string Name { get; set; }
    public required List<string> Links { get; set; }
  }

  public class PatchPlaylistRequest
  {
    public string? Name { get; set; }
    public List<Guid>? AddAudios { get; set; }
    public List<Guid>? RemoveAudios { get; set; }
  }
}
