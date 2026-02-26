using Microsoft.Data.Sqlite;
using AudioArchive.Database;
using AudioArchive.Services;
using Microsoft.EntityFrameworkCore;
using AudioArchive.Models;
using AudioArchive.Database.Entity;
using System.Data;

namespace AudioArchive.Tests.Services
{
  public class AudioServiceTests : IDisposable
  {
    private readonly SqliteConnection _connection;
    private readonly AudioDatabaseContext _database;
    private readonly AudioService _service;

    public AudioServiceTests() {
      _connection = new SqliteConnection("Data Source=:memory:");
      _connection.Open();

      var options = new DbContextOptionsBuilder<AudioDatabaseContext>()
          .UseSqlite(_connection)
          .Options;

      _database = new AudioDatabaseContext(options);
      _database.Database.EnsureCreated();

      _service = new AudioService(_database);
    }

    public void Dispose() {
      _database.Dispose();
      _connection.Dispose();
    }

    [Fact]
    public async Task StoreAudio_CreatesNewArtist_WhenArtistDoesNotExist() {
      var request = new PostAudioRequest {
        Artist = "New Artist",
        Title = "Some Song",
        Link = "",
        Local = false,
        Source = ""
      };


      var result = await _service.StoreAudio(request);

      Assert.NotNull(result);
      Assert.Equal("Some Song", result.Title);
      Assert.Single(await _database.Artists.ToListAsync());
    }

    [Fact]
    public async Task StoreAudio_ReusesExistingArtist_WhenArtistExists() {
      var existingArtist = new Artist { Id = Guid.NewGuid(), Name = "Existing Artist" };
      _database.Artists.Add(existingArtist);
      await _database.SaveChangesAsync();

      var request = new PostAudioRequest {
        Artist = "Existing Artist",
        Title = "Track 1",
        Link = "",
        Local = false,
        Source = ""
      };

      await _service.StoreAudio(request);

      // Should still only have one artist
      Assert.Single(await _database.Artists.ToListAsync());
    }

    [Fact]
    public async Task StoreAudio_ThrowsDuplicateNameException_WhenTitleAlreadyExists() {
      var request = new PostAudioRequest {
        Artist = "Artist",
        Title = "Duplicate Track",
        Link = "",
        Local = false,
        Source = ""
      };

      await _service.StoreAudio(request); // first insert

      await Assert.ThrowsAsync<DuplicateNameException>(() =>
          _service.StoreAudio(request)); // duplicate
    }
  }
}
