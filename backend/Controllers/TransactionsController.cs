using backend.Models.DTO;
using backend.Models.Enums;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using New_Back.Controllers;
using New_Back.Models.API;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController(ITransactionService transactionService) : MyBaseController
{
    private readonly ITransactionService _transactionService = transactionService;

    [HttpGet]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<TransactionDTO>>>> GetAllTransactions()
    {
        var transactions = await _transactionService.GetAllTransactionsAsync();
        return Ok(transactions);
    }

    [HttpGet("autocomplete")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<string>>>> GetTransactionNamesAutoComplete(string query)
    {
        var transactions = await _transactionService.GetTransactionNamesAutoComplete(query);
        return Ok(transactions);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<TransactionDTO>>> GetTransactionById(int id)
    {
        var transaction = await _transactionService.GetTransactionByIdAsync(id);
        return Ok(transaction);
    }

    [HttpGet("last/{count}")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<TransactionDTO>>>> GetLastTransactions([FromQuery] TransactionType? transactionType, int count)
    {
        var transactions = await _transactionService.GetLastTransactionsAsync(transactionType, count);
        return Ok(transactions);
    }

    [HttpPost("query")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<TransactionDTO>>>> QueryTransactions([FromBody] TransactionQueryDTO queryDTO)
    {
        var transactions = await _transactionService.GetTransactionsByQueryAsync(queryDTO);
        return Ok(transactions);
    }

    [HttpPost("admin/apply-cost-types-by-description")]
    [Authorize(Policy = "Permission:EditTransaction")]
    public async Task<ActionResult<APIResponse<List<TransactionDTO>>>> ApplyCostTypesByDescription([FromBody] ApplyCostTypesByDescriptionDTO body)
    {
        var result = await _transactionService.ApplyCostTypesByDescriptionAsync(
            body.Keywords,
            body.StartDate,
            body.EndDate,
            body.CostTypeIds
        );
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "Permission:CreateTransaction")]
    public async Task<ActionResult<APIResponse<TransactionDTO>>> CreateTransaction([FromBody] CreateTransactionDTO createTransactionDTO)
    {
        var transaction = await _transactionService.CreateTransactionAsync(createTransactionDTO);
        var response = APIResponse<TransactionDTO>.SuccessResult(transaction);
        return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, response);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Permission:EditTransaction")]
    public async Task<ActionResult<APIResponse<TransactionDTO>>> UpdateTransaction(int id, [FromBody] CreateTransactionDTO updateTransactionDTO)
    {
        var transaction = await _transactionService.UpdateTransactionAsync(id, updateTransactionDTO);
        return Ok(transaction);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Permission:DeleteTransaction")]
    public async Task<ActionResult> DeleteTransaction(int id)
    {
        await _transactionService.DeleteTransactionAsync(id);
        return Ok(true);
    }
} 