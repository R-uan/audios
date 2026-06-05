using AudioArchive.Database.Entity;
using AudioArchive.Models.Views;

namespace AudioArchive.Models
{
  public record PostAudioResult
  {
    public required bool IsNew { get; init; }  
    public required AudioView Audio { get; init; }
  }
}