using backend.Models;
using backend.Models.DTO;

namespace backend.Services;

public interface ITransactionService
{
    Task<TransactionDTO> CreateTransactionAsync(CreateTransactionDTO createTransactionDTO);
    Task<TransactionDTO> GetTransactionByIdAsync(int id);
    Task<List<TransactionDTO>> GetAllTransactionsAsync();
    Task<List<TransactionDTO>> GetTransactionsByQueryAsync(TransactionQueryDTO queryDTO);
    Task<TransactionDTO> UpdateTransactionAsync(int id, CreateTransactionDTO updateTransactionDTO);
    Task DeleteTransactionAsync(int id);
} 