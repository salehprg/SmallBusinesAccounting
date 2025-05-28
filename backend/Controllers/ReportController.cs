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

        var financialSummary = await _reportService.GetFinancialSummaryAsync(startDate.Value, endDate.Value);
        return Ok(financialSummary);
    }

    [HttpGet("daily-income")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<DailyIncomeDTO>>>> GetDailyIncome([FromQuery] int days = 7)
    {
        var date = DateTime.Now.AddDays(-days);
        var dailyIncome = await _reportService.GetDailyIncomeDataAsync(date, DateTime.Now);
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

        var expensesByCategory = await _reportService.GetExpensesByCategoryAsync(startDate.Value, endDate.Value);
        return Ok(expensesByCategory);
    }
} 