using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeServicesApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgreSQL : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Let ABP Framework handle the schema creation automatically
            // This migration is just a placeholder to mark the database as migrated
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No down migration needed for placeholder
        }
    }
}