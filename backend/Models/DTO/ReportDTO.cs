namespace backend.Models.DTO;

public class FinancialSummaryDTO
{
    public decimal TotalDebts { get; set; }
    public decimal TotalCredits { get; set; }
    public decimal FinancialBalance { get; set; }
}

public class DailyIncomeDTO
{
    public DateTime Date { get; set; }
    public string Day { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal Balance { get; set; }
}

public class ExpensesByCategoryDTO
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Label { get; set; } = string.Empty;
}

public class ReportSummaryDTO
{
    public FinancialSummaryDTO FinancialSummary { get; set; } = new();
    public List<DailyIncomeDTO> DailyIncomeData { get; set; } = new();
    public List<ExpensesByCategoryDTO> ExpensesData { get; set; } = new();
}

public class ReportQueryDTO
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
} 