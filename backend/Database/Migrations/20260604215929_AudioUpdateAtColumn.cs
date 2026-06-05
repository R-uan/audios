using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AudioArchive.Database.Migrations
{
    /// <inheritdoc />
    public partial class AudioUpdateAtColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "audios",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "audios");
        }
    }
}
