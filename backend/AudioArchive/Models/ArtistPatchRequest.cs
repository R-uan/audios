namespace AudioArchive.Models {
  public class PostArtistRequest {
    public required string Name { get; set; }
    public string? Reddit { get; set; }
    public string? Twitter { get; set; }
  }

  public class PatchArtistRequest {
    public string? Name { get; set; }
    public string? Reddit { get; set; }
    public string? Twitter { get; set; }
  }
}
