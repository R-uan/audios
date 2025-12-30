namespace AudioCatalog.Models {
  public class AudioView {
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Artist { get; set; }
    public required int Duration { get; set; }

    public required string Link { get; set; }
    public required string Source { get; set; }
    public required DateTime AddedAt { get; set; }
  }
}
