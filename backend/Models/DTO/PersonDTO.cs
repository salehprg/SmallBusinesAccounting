namespace backend.Models.DTO;

public class CreatePersonDTO
{
    public string PersonName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string PersonType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class PersonDTO
{
    public int Id { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string PersonType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class PersonBalanceDTO
{
    public int Id { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public decimal Balance { get; set; } // Positive for income, negative for expense
    public List<TransactionDTO> Transactions { get; set; } = new List<TransactionDTO>();
} 