namespace backend.Models.DTO;

public class CreateCostTypeDTO
{
    public string Name { get; set; } = string.Empty;
}

public class CostTypeDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
} 