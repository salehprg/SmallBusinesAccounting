namespace backend.Models.DTO;

public class TransactionCostTypeDTO
{
    public int Id { get; set; }
    public int TransactionId { get; set; }
    public int CostTypeId { get; set; }
    public CostType CostType { get; set; }
}

