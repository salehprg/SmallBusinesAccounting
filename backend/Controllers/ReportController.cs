using backend.Models.DTO;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using New_Back.Controllers;
using New_Back.Models.API;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController(IReportService reportService) : MyBaseController
{
    private readonly IReportService _reportService = reportService;

    [HttpGet("summary")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<ReportSummaryDTO>>> GetReportSummary([FromQuery] ReportQueryDTO? queryDTO = null)
    {
        var reportSummary = await _reportService.GetReportSummaryAsync(queryDTO);
        return Ok(reportSummary);
    }


    [HttpGet("financial-summary")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<FinancialSummaryDTO>>> GetFinancialSummary(
        [FromQuery] DateTime? startDate = null, 
        [FromQuery] DateTime? endDate = null)
    {
        startDate ??= DateTime.Now.AddDays(-7);
        endDate ??= DateTime.Now;

        var startDateOnly = DateOnly.FromDateTime(startDate.Value);
        var endDateOnly = DateOnly.FromDateTime(endDate.Value);

        var financialSummary = await _reportService.GetFinancialSummaryAsync(startDateOnly, endDateOnly);
        return Ok(financialSummary);
    }

    [HttpGet("daily-income")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<DailyIncomeDTO>>>> GetDailyIncome([FromQuery] int days = 7)
    {
        var startDate = DateOnly.FromDateTime(DateTime.Now.AddDays(-days));
        var endDate = DateOnly.FromDateTime(DateTime.Now);
        
        var dailyIncome = await _reportService.GetDailyIncomeDataAsync(startDate, endDate);
        return Ok(dailyIncome);
    }

    [HttpGet("expenses-by-category")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<ExpensesByCategoryDTO>>>> GetExpensesByCategory(
        [FromQuery] DateTime? startDate = null, 
        [FromQuery] DateTime? endDate = null)
    {
        startDate ??= DateTime.Now.AddDays(-7);
        endDate ??= DateTime.Now;

        var startDateOnly = DateOnly.FromDateTime(startDate.Value);
        var endDateOnly = DateOnly.FromDateTime(endDate.Value);

        var expensesByCategory = await _reportService.GetExpensesByCategoryAsync(startDateOnly, endDateOnly);
        return Ok(expensesByCategory);
    }
} 