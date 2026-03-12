using AudioArchive.Database;
using AudioArchive.Database.Entity;
using AudioArchive.Models;
using AudioArchive.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Tests.Services
{
  public class TagServiceTests : IDisposable
  {
    private readonly TagService _service;
    private readonly SqliteConnection _connection;
    private readonly AudioDatabaseContext _database;

    public TagServiceTests() {
      _connection = new SqliteConnection("Data Source=:memory:");
      _connection.Open();

      var options = new DbContextOptionsBuilder<AudioDatabaseContext>()
          .UseSqlite(_connection)
          .Options;

      _database = new AudioDatabaseContext(options);
      _database.Database.EnsureCreated();

      _service = new TagService(_database);
    }


    public void Dispose() {
      _database.Dispose();
      _connection.Dispose();
    }

    [Fact]
    public async Task UpdateTagProperties_UpdatesTagName() {
      var existingTag = new Tag { Id = Guid.NewGuid(), Name = "Existing Tag" };
      _database.Tags.Add(existingTag);
      await _database.SaveChangesAsync();

      var request = new PatchTagRequest() { Name = "Updated Tag" };

      var updatedTag = await _service.UpdateTagProperties(existingTag.Id, request);
      Assert.Equal(updatedTag.Name, request.Name);
    }

    [Fact]
    public async Task UpdateTagProperties_UpdatesTagDescription() {
      var existingTag = new Tag { Id = Guid.NewGuid(), Name = "Existing Tag" };
      _database.Tags.Add(existingTag);
      await _database.SaveChangesAsync();

      var request = new PatchTagRequest() { Description = "Updated Description" };

      var updatedTag = await _service.UpdateTagProperties(existingTag.Id, request);
      Assert.Equal(updatedTag.Description, request.Description);
    }
  }
}
