using AudioCatalog.Database.Entity;
using Microsoft.EntityFrameworkCore;

namespace AudioCatalog.Database {
  public class AudioDatabaseContext(DbContextOptions<AudioDatabaseContext> options) : DbContext(options) {
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Audio> Audios { get; set; }
    public DbSet<Tag> Tags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
      modelBuilder.Entity<Artist>(artist => {
        artist.ToTable("artists");
        artist.HasIndex(a => a.Name).IsUnique();
        artist.HasKey(a => a.Id);
        artist.HasMany(a => a.Audios)
              .WithOne(a => a.Artist)
              .HasForeignKey(a => a.ArtistId)
              .OnDelete(DeleteBehavior.Cascade);
      });

      modelBuilder.Entity<Audio>(audio => {
        audio.ToTable("audios");
        audio.HasKey(a => a.Id);
        audio.HasMany(a => a.Tags).WithMany(a => a.Audios);
      });

      modelBuilder.Entity<Tag>(tag => {
        tag.ToTable("tags");
        tag.HasKey(t => t.Id);
      });

      base.OnModelCreating(modelBuilder);
    }
  }
}
