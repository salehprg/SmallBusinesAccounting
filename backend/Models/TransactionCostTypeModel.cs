using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using New_Back.Domain;

namespace backend.Models;

public class TransactionCostTypeModel : BaseEntity
{
    public int TransactionId { get; set; }
    public int CostTypeId { get; set; }

    [ForeignKey("TransactionId")]
    public TransactionModel Transaction { get; set; }

    [ForeignKey("CostTypeId")]
    public CostType CostType { get; set; }
}

