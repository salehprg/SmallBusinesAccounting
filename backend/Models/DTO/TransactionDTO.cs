using backend.Models.Enums;

namespace backend.Models.DTO;

public class CreateTransactionDTO
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsCash { get; set; }
    public DateOnly Date { get; set; }
    public List<int> CostTypes { get; set; } = [];
    public TransactionType TransactionType { get; set; }
    public int? PersonId { get; set; } // Optional
}

public class TransactionDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsCash { get; set; }
    public DateTime SubmitDate { get; set; }
    public DateOnly Date { get; set; }
    public List<TransactionCostTypeDTO> CostTypes { get; set; } = [];
    public TransactionType TransactionType { get; set; }
    public int? PersonId { get; set; }
    public string? PersonName { get; set; }
}

public class TransactionQueryDTO
{
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int? PersonId { get; set; }
    public List<int> CostTypeIds { get; set; } = [];
    public bool NonCostType { get; set; } = false;
    public TransactionType? TransactionType { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
}