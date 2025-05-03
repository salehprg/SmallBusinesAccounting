using backend.Models.DTO;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using New_Back.Controllers;
using New_Back.Models.API;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : MyBaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<APIResponse<AuthResponseDTO>>> Login([FromBody] LoginDTO loginDTO)
    {
        var result = await _authService.LoginAsync(loginDTO);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<APIResponse<AuthResponseDTO>>> Register([FromBody] RegisterDTO registerDTO)
    {
        var result = await _authService.RegisterAsync(registerDTO);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<APIResponse<bool>>> ChangePassword([FromBody] ChangePasswordDTO changePasswordDTO)
    {
        var result = await _authService.ChangePasswordAsync(UserId, changePasswordDTO);
        return Ok(result);
    }
} 