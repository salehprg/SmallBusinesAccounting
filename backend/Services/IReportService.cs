using backend.Models.DTO;

namespace backend.Services;

public interface IReportService
{
    Task<ReportSummaryDTO> GetReportSummaryAsync(ReportQueryDTO? queryDTO = null);
    Task<FinancialSummaryDTO> GetFinancialSummaryAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<List<DailyIncomeDTO>> GetDailyIncomeDataAsync(int days = 7);
    Task<List<ExpensesByCategoryDTO>> GetExpensesByCategoryAsync(DateTime? startDate = null, DateTime? endDate = null);
} 