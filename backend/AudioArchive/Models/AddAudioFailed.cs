using AudioArchive.Database.Entity;

namespace AudioArchive.Models
{
  // Duplicated audios are by artist, not globally. 
  // Distinct artists may have audios with the same name.
  // Different versions of the same audio shall be explicitly declared on title.
  public class AddAudioFailed
  {
    public required string Title { get; set; }
    public required string Artist { get; set; }

    public static AddAudioFailed From(PostAudioRequest request)
      => new AddAudioFailed {
        Title = request.Title,
        Artist = request.Artist,
      };
  }
}
