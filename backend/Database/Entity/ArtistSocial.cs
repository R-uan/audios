namespace AudioArchive.Database.Entity
{
  public class ArtistSocial
  {
    public int Id { get; set; }

    public required Guid ArtistId { get; set; }
    public required string Name { get; set; }
    public required string Url { get; set; }
    public DateTime AddedAt { get; set; }

    public required Artist Artist { get; set; }
  }
}
