using System.Text.RegularExpressions;
using AudioArchive.Models;
using HtmlAgilityPack;

namespace AudioArchive.Providers {
  public class SoundgasmProvider {
    private static readonly HttpClient client = new HttpClient();

    public static async Task<PostAudioRequest> ScrapAudioAsync(string url) {
      var html = await client.GetStringAsync(url);
      var audioPerformer = SoundgasmProvider.GetPerformer(url);
      var audioSource = SoundgasmProvider.GetAudioSource(html);
      var audioTitle = SoundgasmProvider.GetAudioTitle(html);

      return new PostAudioRequest {
        Artist = audioPerformer,
        Link = url,
        Local = false,
        Source = audioSource,
        Title = audioTitle
      };
    }

    private static string GetPerformer(string url) {
      var regex = new Regex(@"(?<=https://soundgasm\.net/u/)(.*)(?=/)", RegexOptions.IgnoreCase);
      var match = regex.Match(url);
      if (!match.Success) throw new Exception("Invalid URL: performer not found");
      return match.Value;
    }

    private static string GetAudioSource(string html) {
      var doc = new HtmlDocument();
      doc.LoadHtml(html);

      var scriptContent = doc.DocumentNode
        .SelectNodes("//script")?
        .Select(node => node.InnerText)
        .FirstOrDefault(text => text.Contains("sounds/")) ??
      throw new Exception("Script content not found.");

      var regex = new Regex(@"(?<=sounds/)(.*)(?=\.m4a)", RegexOptions.IgnoreCase | RegexOptions.Multiline);
      var match = regex.Match(scriptContent);

      if (!match.Success) throw new Exception("Audio ID not found.");
      return $"https://media.soundgasm.net/sounds/{match.Value}.m4a";
    }

    private static string GetAudioTitle(string html) {
      var doc = new HtmlDocument();
      doc.LoadHtml(html);

      var titleNode = doc.DocumentNode.SelectSingleNode("//*[@class='jp-title']");
      return titleNode?.InnerText ?? string.Empty;
    }
  }
}
