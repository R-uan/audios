namespace AudioArchive.Models {
  public class AudioSearchParams {
    public string? Title { get; set; }
    public string? Artist { get; set; }
    public List<string>? Tags { get; set; }
    public int? MaxDuration { get; set; }
    public int? MinDuration { get; set; }
  }
}
