using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AudioCatalog.Database.Migrations
{
    /// <inheritdoc />
    public partial class ArtistNameUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_artists_Name",
                table: "artists",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_artists_Name",
                table: "artists");
        }
    }
}
