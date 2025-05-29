using backend.Models;
using backend.Models.DTO;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;
using System.Globalization;

namespace backend.Services;

public class ReportService : IReportService
{
    private readonly IRepository<TransactionModel> _transactionRepository;
    private readonly PersianCalendar _persianCalendar;

    public ReportService(IRepository<TransactionModel> transactionRepository)
    {
        _transactionRepository = transactionRepository;
        _persianCalendar = new PersianCalendar();
    }

    public async Task<ReportSummaryDTO> GetReportSummaryAsync(ReportQueryDTO? queryDTO = null)
    {
        queryDTO ??= new ReportQueryDTO();

        var financialSummary = await GetFinancialSummaryAsync(queryDTO.StartDate, queryDTO.EndDate);
        var dailyIncomeData = await GetDailyIncomeDataAsync(queryDTO.StartDate, queryDTO.EndDate);
        var expensesData = await GetExpensesByCategoryAsync(queryDTO.StartDate, queryDTO.EndDate);

        return new ReportSummaryDTO
        {
            FinancialSummary = financialSummary,
            DailyIncomeData = dailyIncomeData,
            ExpensesData = expensesData
        };
    }

    public async Task<FinancialSummaryDTO> GetFinancialSummaryAsync(DateTime startDate, DateTime endDate)
    {
        var query = _transactionRepository.GetAll().AsQueryable();

        // Apply date filters if provided
        query = query.Where(t => t.Date >= startDate && t.Date <= endDate);


        decimal totalDebts = query.Where(t => t.TransactionType == TransactionType.Expense).Sum(t => t.Amount);
        decimal totalCredits = query.Where(t => t.TransactionType == TransactionType.Income).Sum(t => t.Amount);

        return new FinancialSummaryDTO
        {
            TotalDebts = totalDebts,
            TotalCredits = totalCredits,
            FinancialBalance = totalCredits - totalDebts
        };
    }

    public async Task<List<DailyIncomeDTO>> GetDailyIncomeDataAsync(DateTime startDate, DateTime endDate)
    {
        var transactions = await _transactionRepository.GetAll()
            .Where(t => t.Date >= startDate && t.Date <= endDate)
            .ToListAsync();

        var days = (endDate - startDate).Days + 1; // Include both start and end dates

        List<DailyIncomeDTO> dailyIncomeList = [];

        for (int i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i).Date; // Use .Date to get just the date part without time
            var persianMonth = _persianCalendar.GetMonth(date);
            var persianDay = _persianCalendar.GetDayOfMonth(date);
            var day = $"{persianMonth}/{persianDay}";
            
            var todayTransactions = transactions.Where(t => t.Date.ToLocalTime().Date == date.Date).ToList();

            decimal income = todayTransactions.Where(t => t.TransactionType == TransactionType.Income).Sum(t => t.Amount);
            decimal expenses = todayTransactions.Where(t => t.TransactionType == TransactionType.Expense).Sum(t => t.Amount);
            DailyIncomeDTO dailyIncome = new DailyIncomeDTO
            {
                Date = date,
                Day = day,
                Income = income,
                Expenses = expenses,
                Balance = income - expenses
            };

            dailyIncomeList.Add(dailyIncome);
        }

        return dailyIncomeList;
    }

    public async Task<List<ExpensesByCategoryDTO>> GetExpensesByCategoryAsync(DateTime startDate, DateTime endDate)
    {
        var query = _transactionRepository.GetAll()
            .Include(t => t.CostType)
            .Where(t => t.TransactionType == TransactionType.Expense);

        // Apply date filters if provided
        query = query.Where(t => t.Date >= startDate && t.Date <= endDate);

        var transactions = await query.ToListAsync();

        // Group expenses by category
        var expensesByCategory = transactions
            .GroupBy(t => new
            {
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