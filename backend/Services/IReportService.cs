using backend.Models.DTO;

namespace backend.Services;

public interface IReportService
{
    Task<ReportSummaryDTO> GetReportSummaryAsync(ReportQueryDTO? queryDTO = null);
    Task<FinancialSummaryDTO> GetFinancialSummaryAsync(DateOnly startDate, DateOnly endDate);
    Task<List<DailyIncomeDTO>> GetDailyIncomeDataAsync(DateOnly startDate, DateOnly endDate);
    Task<List<ExpensesByCategoryDTO>> GetExpensesByCategoryAsync(DateOnly startDate, DateOnly endDate);
} 