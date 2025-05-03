using backend.Models;
using backend.Models.DTO;

namespace backend.Services;

public interface ICostTypeService
{
    Task<CostTypeDTO> CreateCostTypeAsync(CreateCostTypeDTO createCostTypeDTO);
    Task<CostTypeDTO> GetCostTypeByIdAsync(int id);
    Task<List<CostTypeDTO>> GetAllCostTypesAsync();
    Task<CostTypeDTO> UpdateCostTypeAsync(int id, CreateCostTypeDTO updateCostTypeDTO);
    Task DeleteCostTypeAsync(int id);
} 