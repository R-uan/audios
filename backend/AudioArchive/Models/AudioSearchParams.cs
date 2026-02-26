namespace AudioArchive.Models
{
  public class AudioSearchParams
  {
    public string? Title { get; set; }
    public string? Artist { get; set; }
    public string? IncludeTags { get; set; }
    public string? ExcludeTags { get; set; }
    public int? MaxDuration { get; set; }
    public int? MinDuration { get; set; }
  }
}
