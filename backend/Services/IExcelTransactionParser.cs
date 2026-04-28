namespace backend.Services;

/// <summary>
/// One data row from the bank-statement Excel (fixed column layout). No validation.
/// </summary>
public sealed record RawExcelRow(
    int StatementRowNumber,
    string? DateText,
    string Description,
    decimal Deposit,
    decimal Withdrawal);

public interface IExcelTransactionParser
{
    /// <summary>
    /// Reads the first worksheet, skips row 1 (header), returns all non-empty data rows.
    /// Throws invalid-upload application errors when the workbook cannot be read.
    /// </summary>
    List<RawExcelRow> Parse(Stream stream, string? fileName);
}
