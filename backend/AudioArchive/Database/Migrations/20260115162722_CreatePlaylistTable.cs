using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AudioArchive.Database.Migrations
{
    /// <inheritdoc />
    public partial class CreatePlaylistTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "playlists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playlists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AudioPlaylist",
                columns: table => new
                {
                    AudiosId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlaylistsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AudioPlaylist", x => new { x.AudiosId, x.PlaylistsId });
                    table.ForeignKey(
                        name: "FK_AudioPlaylist_audios_AudiosId",
                        column: x => x.AudiosId,
                        principalTable: "audios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AudioPlaylist_playlists_PlaylistsId",
                        column: x => x.PlaylistsId,
                        principalTable: "playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AudioPlaylist_PlaylistsId",
                table: "AudioPlaylist",
                column: "PlaylistsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AudioPlaylist");

            migrationBuilder.DropTable(
                name: "playlists");
        }
    }
}
