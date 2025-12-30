namespace AudioCatalog.Models {
  public class PostAudioRequest {
    public required string Title { get; set; }
    public required string Artist { get; set; }
    public required string Link { get; set; }
    public required string Source { get; set; }
    public int Duration { get; set; }
    public List<string>? Tags { get; set; }
  }
}
