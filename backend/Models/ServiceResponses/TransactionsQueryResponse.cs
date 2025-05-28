using backend.Models.DTO;

namespace backend.Models.ServiceResponses;

public class TransactionsQueryResponse
{
    public List<TransactionDTO> Transactions { get; set; }
    public decimal Balance { get; set; }
    public int Total { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
}
