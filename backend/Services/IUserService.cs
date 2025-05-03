using backend.Models.DTO;
using New_Back.Models;

namespace backend.Services;

public interface IUserService
{
    Task<UserDTO> GetByIdAsync(int id);
    Task<List<UserDTO>> GetAllAsync();
    Task<UserDTO> CreateAsync(CreateUserDTO createUserDTO);
    Task<UserDTO> UpdateAsync(int id, UpdateUserDTO updateUserDTO);
    Task DeleteAsync(int id);
    Task<UserDTO> UpdateUserRolesAsync(UpdateUserRolesDTO updateUserRolesDTO);
    Task<List<string>> GetUserPermissionsAsync(int userId);
    Task<bool> UserHasPermissionAsync(int userId, string permissionName);
    Task<UserModel> GetUserByUsernameAsync(string username);
    Task<bool> VerifyPasswordAsync(UserModel user, string password);
} 