using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminAndSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin@arrivenow.com", "$2a$11$DuJo7jxzUwBaDdINcbzgsOGJAYF7iDgJffCmn4AhSmX8VlGbMfF8e" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin@test.com", "$2a$11$XZPPqKjhrvOL.nJZqSJJUeWQXM0YqKK0VZ0hRFqVZ6tGHW8Q.JT0K" });
        }
    }
}
