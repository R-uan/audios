using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AudioCatalog.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "artists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Reddit = table.Column<string>(type: "text", nullable: true),
                    Twitter = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_artists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "audios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ArtistId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Link = table.Column<string>(type: "text", nullable: true),
                    Local = table.Column<bool>(type: "boolean", nullable: false),
                    Source = table.Column<string>(type: "text", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_audios_artists_ArtistId",
                        column: x => x.ArtistId,
                        principalTable: "artists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "audio_metadata",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AudioId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReleaseYear = table.Column<int>(type: "integer", nullable: true),
                    Genrer = table.Column<string>(type: "text", nullable: true),
                    Duration = table.Column<int>(type: "integer", nullable: true),
                    Mood = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audio_metadata", x => x.Id);
                    table.ForeignKey(
                        name: "FK_audio_metadata_audios_AudioId",
                        column: x => x.AudioId,
                        principalTable: "audios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "audio_metadata_tags",
                columns: table => new
                {
                    AudioMetadatasId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audio_metadata_tags", x => new { x.AudioMetadatasId, x.TagsId });
                    table.ForeignKey(
                        name: "FK_audio_metadata_tags_audio_metadata_AudioMetadatasId",
                        column: x => x.AudioMetadatasId,
                        principalTable: "audio_metadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_audio_metadata_tags_tags_TagsId",
                        column: x => x.TagsId,
                        principalTable: "tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_artists_Name",
                table: "artists",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_audio_metadata_AudioId",
                table: "audio_metadata",
                column: "AudioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_audio_metadata_tags_TagsId",
                table: "audio_metadata_tags",
                column: "TagsId");

            migrationBuilder.CreateIndex(
                name: "IX_audios_ArtistId",
                table: "audios",
                column: "ArtistId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audio_metadata_tags");

            migrationBuilder.DropTable(
                name: "audio_metadata");

            migrationBuilder.DropTable(
                name: "tags");

            migrationBuilder.DropTable(
                name: "audios");

            migrationBuilder.DropTable(
                name: "artists");
        }
    }
}
