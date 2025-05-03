using backend.Models.DTO;

namespace backend.Services;

public interface IAuthService
{
    Task<AuthResponseDTO> LoginAsync(LoginDTO loginDTO);
    Task<AuthResponseDTO> RegisterAsync(RegisterDTO registerDTO);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDTO);
    Task<string> GenerateJwtTokenAsync(int userId);
} 