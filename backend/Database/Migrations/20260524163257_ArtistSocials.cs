using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AudioArchive.Database.Migrations
{
    /// <inheritdoc />
    public partial class ArtistSocials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AudioPlaylist_audios_AudiosId",
                table: "AudioPlaylist");

            migrationBuilder.DropForeignKey(
                name: "FK_AudioPlaylist_playlists_PlaylistsId",
                table: "AudioPlaylist");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AudioPlaylist",
                table: "AudioPlaylist");

            migrationBuilder.DropColumn(
                name: "Reddit",
                table: "artists");

            migrationBuilder.RenameTable(
                name: "AudioPlaylist",
                newName: "playlist_audios");

            migrationBuilder.RenameColumn(
                name: "Twitter",
                table: "artists",
                newName: "Nationality");

            migrationBuilder.RenameIndex(
                name: "IX_AudioPlaylist_PlaylistsId",
                table: "playlist_audios",
                newName: "IX_playlist_audios_PlaylistsId");

            migrationBuilder.AddColumn<bool>(
                name: "InActivity",
                table: "artists",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_playlist_audios",
                table: "playlist_audios",
                columns: new[] { "AudiosId", "PlaylistsId" });

            migrationBuilder.CreateTable(
                name: "artist_socials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ArtistId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_artist_socials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_artist_socials_artists_ArtistId",
                        column: x => x.ArtistId,
                        principalTable: "artists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_artist_socials_ArtistId",
                table: "artist_socials",
                column: "ArtistId");

            migrationBuilder.AddForeignKey(
                name: "FK_playlist_audios_audios_AudiosId",
                table: "playlist_audios",
                column: "AudiosId",
                principalTable: "audios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_playlist_audios_playlists_PlaylistsId",
                table: "playlist_audios",
                column: "PlaylistsId",
                principalTable: "playlists",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_playlist_audios_audios_AudiosId",
                table: "playlist_audios");

            migrationBuilder.DropForeignKey(
                name: "FK_playlist_audios_playlists_PlaylistsId",
                table: "playlist_audios");

            migrationBuilder.DropTable(
                name: "artist_socials");

            migrationBuilder.DropPrimaryKey(
                name: "PK_playlist_audios",
                table: "playlist_audios");

            migrationBuilder.DropColumn(
                name: "InActivity",
                table: "artists");

            migrationBuilder.RenameTable(
                name: "playlist_audios",
                newName: "AudioPlaylist");

            migrationBuilder.RenameColumn(
                name: "Nationality",
                table: "artists",
                newName: "Twitter");

            migrationBuilder.RenameIndex(
                name: "IX_playlist_audios_PlaylistsId",
                table: "AudioPlaylist",
                newName: "IX_AudioPlaylist_PlaylistsId");

            migrationBuilder.AddColumn<string>(
                name: "Reddit",
                table: "artists",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_AudioPlaylist",
                table: "AudioPlaylist",
                columns: new[] { "AudiosId", "PlaylistsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_AudioPlaylist_audios_AudiosId",
                table: "AudioPlaylist",
                column: "AudiosId",
                principalTable: "audios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AudioPlaylist_playlists_PlaylistsId",
                table: "AudioPlaylist",
                column: "PlaylistsId",
                principalTable: "playlists",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
