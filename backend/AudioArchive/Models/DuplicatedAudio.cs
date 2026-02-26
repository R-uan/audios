using AudioArchive.Database.Entity;

namespace AudioArchive.Models
{
  // Duplicated audios are by artist, not globally. 
  // Distinct artists may have audios with the same name.
  // Different versions of the same audio shall be explicitly declared on title.
  public class DuplicatedAudio
  {
    public required string Title { get; set; }
    public required string Artist { get; set; }

    public static DuplicatedAudio From(Audio audio)
      => new DuplicatedAudio {
        Title = audio.Title,
        Artist = audio.Artist.Name,
      };

    public static DuplicatedAudio From(PostAudioRequest request)
      => new DuplicatedAudio {
        Title = request.Title,
        Artist = request.Artist
      };
  }
}
