using backend.Models.DTO;

namespace backend.Services;

public interface IReportService
{
    Task<ReportSummaryDTO> GetReportSummaryAsync(ReportQueryDTO? queryDTO = null);
    Task<FinancialSummaryDTO> GetFinancialSummaryAsync(DateTime startDate, DateTime endDate);
    Task<List<DailyIncomeDTO>> GetDailyIncomeDataAsync(DateTime startDate, DateTime endDate);
    Task<List<ExpensesByCategoryDTO>> GetExpensesByCategoryAsync(DateTime startDate, DateTime endDate);
} 