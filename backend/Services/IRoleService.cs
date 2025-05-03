using backend.Models.DTO;

namespace backend.Services;

public interface IRoleService
{
    Task<RoleDTO> GetByIdAsync(int id);
    Task<List<RoleDTO>> GetAllAsync();
    Task<RoleDTO> CreateAsync(CreateRoleDTO createRoleDTO);
    Task<RoleDTO> UpdateAsync(int id, UpdateRoleDTO updateRoleDTO);
    Task DeleteAsync(int id);
    Task<RoleDTO> UpdateRolePermissionsAsync(UpdateRolePermissionsDTO updateRolePermissionsDTO);
} 