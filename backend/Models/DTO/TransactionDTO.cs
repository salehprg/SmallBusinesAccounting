using backend.Models.Enums;

namespace backend.Models.DTO;

public class CreateTransactionDTO
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int CostTypeId { get; set; }
    public TransactionType TransactionType { get; set; }
    public int? PersonId { get; set; } // Optional
}

public class TransactionDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int CostTypeId { get; set; }
    public string CostTypeName { get; set; } = string.Empty;
    public TransactionType TransactionType { get; set; }
    public int? PersonId { get; set; }
    public string? PersonName { get; set; }
}

public class TransactionQueryDTO
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? PersonId { get; set; }
    public int? CostTypeId { get; set; }
    public TransactionType? TransactionType { get; set; }
} 