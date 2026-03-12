using AudioArchive.Models;

namespace AudioArchive.Shared
{
  public class NotFoundException(string field, string target) :
  Exception($"{field} ID was not found: {target}.")
  {
    public string Target { get; } = target;
  }

  public class DuplicatedAudioException(DuplicatedAudio entry) :
    Exception($"Artist ({entry.Artist}) already contains an audio ({entry.Title}) with that title")
  {
    public DuplicatedAudio Entry { get; } = entry;
  }
}
