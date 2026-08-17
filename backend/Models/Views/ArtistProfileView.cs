using AudioArchive.Database.Entity;

namespace AudioArchive.Models.Views
{
  public record TagFrequency(string Name, int Count);

  public class ArtistProfileView
  {
    public required string Name { get; set; }
    public bool InActivity { get; set; }
    public string? Nationality { get; set; }
    public string? Note { get; set; }
    public int AudioCount { get; set; }
    public List<TagFrequency>? MostFrequentTags { get; set; }

    public static ArtistProfileView From(Artist artist) {
      return new ArtistProfileView {
        Name = artist.Name,
        AudioCount = artist.Audios != null ? artist.Audios.Count : 0,
        Nationality = artist.Nationality,
        InActivity = artist.InActivity,
        Note = artist.Note,
        MostFrequentTags = artist.Audios?.SelectMany(audio => audio.Metadata.Tags)
          .GroupBy(tag => tag.Name)
          .OrderByDescending(group => group.Count())
          .Take(3)
          .Select(group => new TagFrequency(group.Key, group.Count()))
          .ToList()
      };
    }
  }
}
