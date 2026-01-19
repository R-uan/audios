using AudioArchive.Database.Entity;
using Microsoft.EntityFrameworkCore;

namespace AudioArchive.Database {
  public class AudioDatabaseContext(DbContextOptions<AudioDatabaseContext> options) : DbContext(options) {
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Audio> Audios { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Playlist> Playlists { get; set; }
    public DbSet<AudioMetadata> AudioMetadata { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
      modelBuilder.Entity<Artist>(artist => {
        artist.ToTable("artists");
        artist.HasKey(a => a.Id);
        artist.HasIndex(a => a.Name).IsUnique();
        artist.HasMany(a => a.Audios)
              .WithOne(a => a.Artist)
              .HasForeignKey(a => a.ArtistId)
              .OnDelete(DeleteBehavior.Cascade);
      });

      modelBuilder.Entity<Audio>(audio => {
        audio.ToTable("audios");
        audio.HasKey(a => a.Id);
        audio.HasOne(a => a.Metadata)
             .WithOne(m => m.Audio)
             .HasForeignKey<AudioMetadata>(m => m.AudioId)
             .OnDelete(DeleteBehavior.Cascade);
      });

      modelBuilder.Entity<AudioMetadata>(metadata => {
        metadata.ToTable("audio_metadata");
        metadata.HasKey(m => m.Id);
        metadata.HasMany(m => m.Tags)
                .WithMany(t => t.AudioMetadatas)
                .UsingEntity(j => j.ToTable("audio_metadata_tags")); // Optional: custom join table name
      });

      modelBuilder.Entity<Tag>(tag => {
        tag.ToTable("tags");
        tag.HasKey(t => t.Id);
      });

      modelBuilder.Entity<Playlist>(p => {
        p.ToTable("playlists");
        p.HasMany(p => p.Audios).WithMany(a => a.Playlists);
      });

      base.OnModelCreating(modelBuilder);
    }
  }
}
