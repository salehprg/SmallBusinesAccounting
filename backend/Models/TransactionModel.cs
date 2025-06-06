using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using New_Back.Domain;

namespace backend.Models;

public class TransactionModel : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsCash { get; set; }
    public DateTime? UpdateDate { get; set; }
    public DateTime SubmitDate { get; set; }
    public DateTime Date { get; set; }
    public TransactionType TransactionType { get; set; }
    
    // Optional reference to a person
    public int? PersonId { get; set; }
    [ForeignKey("PersonId")]
    public PersonModel? Person { get; set; }

    public virtual ICollection<TransactionCostTypeModel> CostTypes { get; set; } = [];
    
}

