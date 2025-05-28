using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class IsCash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_CostTypes_CostTypeId",
                table: "Transactions");

            migrationBuilder.AlterColumn<int>(
                name: "CostTypeId",
                table: "Transactions",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<bool>(
                name: "IsCash",
                table: "Transactions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_CostTypes_CostTypeId",
                table: "Transactions",
                column: "CostTypeId",
                principalTable: "CostTypes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_CostTypes_CostTypeId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "IsCash",
                table: "Transactions");

            migrationBuilder.AlterColumn<int>(
                name: "CostTypeId",
                table: "Transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_CostTypes_CostTypeId",
                table: "Transactions",
                column: "CostTypeId",
                principalTable: "CostTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
