namespace AudioArchive.Models
{
  public class PostArtistRequest
  {
    public required string Name { get; set; }
    public string? Nationality { get; set; }
    public string? Note { get; set; }

    public bool? InActivity { get; set; }
  }

  public class PatchArtistRequest
  {
    public string? Name { get; set; }
    public string? Nationality { get; set; }
    public string? Note { get; set; }

    public bool? InActivity { get; set; }
  }
}
