namespace AudioArchive.Models {
  public class ArtistPatchRequest {
    public string? Name { get; set; }
    public string? Reddit { get; set; }
    public string? Twitter { get; set; }
  }

  public class ArtistPostRequest {
    public required string Name { get; set; }
    public string? Reddit { get; set; }
    public string? Twitter { get; set; }
  }
}
