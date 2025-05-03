using backend.Models.DTO;

namespace backend.Services;

public interface IPermissionService
{
    Task<PermissionDTO> GetByIdAsync(int id);
    Task<List<PermissionDTO>> GetAllAsync();
    Task<PermissionDTO> CreateAsync(PermissionDTO createDTO);
    Task<PermissionDTO> UpdateAsync(int id, PermissionDTO updateDTO);
    Task DeleteAsync(int id);
    Task SeedDefaultPermissionsAsync();
} 