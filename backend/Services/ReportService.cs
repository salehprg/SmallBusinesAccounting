using backend.Models;
using backend.Models.DTO;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;

namespace backend.Services;

public class ReportService : IReportService
{
    private readonly IRepository<TransactionModel> _transactionRepository;

    public ReportService(IRepository<TransactionModel> transactionRepository)
    {
        _transactionRepository = transactionRepository;
    }

    public async Task<ReportSummaryDTO> GetReportSummaryAsync(ReportQueryDTO? queryDTO = null)
    {
        queryDTO ??= new ReportQueryDTO();

        var financialSummary = await GetFinancialSummaryAsync(queryDTO.StartDate, queryDTO.EndDate);
        var dailyIncomeData = await GetDailyIncomeDataAsync(queryDTO.DaysForDailyIncome);
        var expensesData = await GetExpensesByCategoryAsync(queryDTO.StartDate, queryDTO.EndDate);

        return new ReportSummaryDTO
        {
            FinancialSummary = financialSummary,
            DailyIncomeData = dailyIncomeData,
            ExpensesData = expensesData
        };
    }

    public async Task<FinancialSummaryDTO> GetFinancialSummaryAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _transactionRepository.GetAll().AsQueryable();

        // Apply date filters if provided
        if (startDate.HasValue)
        {
            query = query.Where(t => t.Date >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(t => t.Date <= endDate.Value);
        }

        decimal totalDebts = query.Where(t => t.TransactionType == TransactionType.Expense).Sum(t => t.Amount);
        decimal totalCredits = query.Where(t => t.TransactionType == TransactionType.Income).Sum(t => t.Amount);

        return new FinancialSummaryDTO
        {
            TotalDebts = totalDebts,
            TotalCredits = totalCredits,
            FinancialBalance = totalCredits - totalDebts
        };
    }

    public async Task<List<DailyIncomeDTO>> GetDailyIncomeDataAsync(int days = 7)
    {
        var now = DateTime.UtcNow.Date;
        var startDate = now.AddDays(-(days - 1));

        var transactions = await _transactionRepository.GetAll()
            .Where(t => t.TransactionType == TransactionType.Income && t.Date >= startDate && t.Date <= now)
            .ToListAsync();

        // Initialize daily income dictionary with the specified number of days
        var dailyIncome = new Dictionary<string, decimal>();
        for (int i = days - 1; i >= 0; i--)
        {
            var date = now.AddDays(-i);
            var day = date.Day.ToString();
            dailyIncome[day] = 0;
        }

        // Sum up income for each day
        foreach (var transaction in transactions)
        {
            var day = transaction.Date.Day.ToString();
            if (dailyIncome.ContainsKey(day))
            {
                dailyIncome[day] += transaction.Amount;
            }
        }

        // Convert to list format
        return dailyIncome.Select(kvp => new DailyIncomeDTO
        {
            Day = kvp.Key,
            Amount = kvp.Value
        }).ToList();
    }

    public async Task<List<ExpensesByCategoryDTO>> GetExpensesByCategoryAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _transactionRepository.GetAll()
            .Include(t => t.CostType)
            .Where(t => t.TransactionType == TransactionType.Expense);

        // Apply date filters if provided
        if (startDate.HasValue)
        {
            query = query.Where(t => t.Date >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(t => t.Date <= endDate.Value);
        }

        var transactions = await query.ToListAsync();

        // Group expenses by category
        var expensesByCategory = transactions
            .GroupBy(t => new { 
                Category = t.CostType?.Name ?? "Uncategorized",
                Label = t.CostType?.Name ?? "Uncategorized"
            })
            .Select(g => new ExpensesByCategoryDTO
            {
                Category = g.Key.Category,
                Label = g.Key.Label,
                Amount = g.Sum(t => t.Amount)
            })
            .ToList();

        return expensesByCategory;
    }
} 