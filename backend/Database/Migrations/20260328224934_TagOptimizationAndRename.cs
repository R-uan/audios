using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AudioArchive.Database.Migrations
{
  /// <inheritdoc />
  public partial class TagOptimizationAndRename : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
      migrationBuilder.DropColumn(
          name: "Mood",
          table: "audio_metadata");

      migrationBuilder.RenameColumn(
          name: "Genrer",
          table: "audio_metadata",
          newName: "Genre");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
      migrationBuilder.RenameColumn(
          name: "Genre",
          table: "audio_metadata",
          newName: "Genrer");

      migrationBuilder.AddColumn<string>(
          name: "Mood",
          table: "audio_metadata",
          type: "text",
          nullable: true);
    }
  }
}
