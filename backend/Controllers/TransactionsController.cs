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
public class TransactionsController : MyBaseController
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<TransactionDTO>>>> GetAllTransactions()
    {
        var transactions = await _transactionService.GetAllTransactionsAsync();
        return Ok(transactions);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<TransactionDTO>>> GetTransactionById(int id)
    {
        var transaction = await _transactionService.GetTransactionByIdAsync(id);
        return Ok(transaction);
    }

    [HttpPost("query")]
    [Authorize(Policy = "Permission:ViewTransactions")]
    public async Task<ActionResult<APIResponse<List<TransactionDTO>>>> QueryTransactions([FromBody] TransactionQueryDTO queryDTO)
    {
        var transactions = await _transactionService.GetTransactionsByQueryAsync(queryDTO);
        return Ok(transactions);
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
        return Ok();
    }
} 