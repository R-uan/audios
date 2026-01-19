namespace AudioArchive.Models {
  public class PostAudioRequest {
    public required string Title { get; set; }
    public required string Artist { get; set; }
    public required string Link { get; set; }
    public required string Source { get; set; }
    public required bool Local { get; set; }
    // Metadata
    public string? Mood { get; set; }
    public int? Duration { get; set; }
    public string? Genrer { get; set; }
    public int? ReleaseYear { get; set; }
    public List<string>? Tags { get; set; }
  }
}
