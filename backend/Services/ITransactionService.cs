using backend.Models;
using backend.Models.DTO;
using backend.Models.Enums;

namespace backend.Services;

public interface ITransactionService
{
    Task<TransactionDTO> CreateTransactionAsync(CreateTransactionDTO createTransactionDTO);
    Task<TransactionDTO> GetTransactionByIdAsync(int id);
    Task<List<TransactionDTO>> GetAllTransactionsAsync();
    Task<List<string>> GetTransactionNamesAutoComplete(string query);
    Task<List<TransactionDTO>> GetTransactionsByQueryAsync(TransactionQueryDTO queryDTO);
    Task<TransactionDTO> UpdateTransactionAsync(int id, CreateTransactionDTO updateTransactionDTO);
    Task DeleteTransactionAsync(int id);
    Task<List<TransactionDTO>> GetLastTransactionsAsync(TransactionType? transactionType, int count);
} 