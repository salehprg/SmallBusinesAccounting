using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class CostTypeIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_CostTypes_CostTypeId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CostTypeId",
                table: "Transactions");

            migrationBuilder.CreateTable(
                name: "TransactionCostTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TransactionId = table.Column<int>(type: "integer", nullable: false),
                    CostTypeId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionCostTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransactionCostTypes_CostTypes_CostTypeId",
                        column: x => x.CostTypeId,
                        principalTable: "CostTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransactionCostTypes_Transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransactionCostTypes_CostTypeId",
                table: "TransactionCostTypes",
                column: "CostTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionCostTypes_TransactionId",
                table: "TransactionCostTypes",
                column: "TransactionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransactionCostTypes");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CostTypeId",
                table: "Transactions",
                column: "CostTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_CostTypes_CostTypeId",
                table: "Transactions",
                column: "CostTypeId",
                principalTable: "CostTypes",
                principalColumn: "Id");
        }
    }
}
