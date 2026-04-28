using backend.Models.Enums;

namespace backend.Models.DTO;

public class BulkTransactionPreviewRowDTO
{
    public int RowNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsCash { get; set; }
    public DateOnly Date { get; set; }
    public TransactionType? TransactionType { get; set; }
    public int? PersonId { get; set; }
    public string? PersonName { get; set; }
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = [];
}

public class BulkTransactionPreviewResponseDTO
{
    public int TotalRows { get; set; }
    public int ValidRowsCount { get; set; }
    public int InvalidRowsCount { get; set; }
    public List<BulkTransactionPreviewRowDTO> Rows { get; set; } = [];
    public List<BulkTransactionPreviewRowDTO> ValidRows { get; set; } = [];
}

public class BulkTransactionImportRowDTO
{
    public int RowNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsCash { get; set; }
    public DateOnly Date { get; set; }
    public TransactionType TransactionType { get; set; }
    public int? PersonId { get; set; }
    public List<int> CostTypes { get; set; } = [];
}

public class BulkTransactionImportRequestDTO
{
    public List<BulkTransactionImportRowDTO> Rows { get; set; } = [];
}

public class BulkTransactionImportResultDTO
{
    public int InsertedCount { get; set; }
    public List<int> InsertedTransactionIds { get; set; } = [];
}
