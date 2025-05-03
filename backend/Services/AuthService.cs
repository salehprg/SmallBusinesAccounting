using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using backend.Models.DTO;
using Microsoft.IdentityModel.Tokens;
using New_Back.Exceptions;
using New_Back.Models;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserService userService,
        IMapper mapper,
        IConfiguration configuration)
    {
        _userService = userService;
        _mapper = mapper;
        _configuration = configuration;
    }

    public async Task<AuthResponseDTO> LoginAsync(LoginDTO loginDTO)
    {
        var user = await _userService.GetUserByUsernameAsync(loginDTO.Username);
        if (user == null)
        {
            throw AppErrors.InvalidCredentials;
        }

        if (!await _userService.VerifyPasswordAsync(user, loginDTO.Password))
        {
            throw AppErrors.InvalidCredentials;
        }

        if (user.IsBanned)
        {
            throw AppErrors.UserBanned;
        }

        if (!user.IsActive)
        {
            throw AppErrors.UserInactive;
        }

        // Update last login time
        user.LastLogin = DateTime.UtcNow;
        
        var userDTO = await _userService.GetByIdAsync(user.Id);
        var permissions = await _userService.GetUserPermissionsAsync(user.Id);
        
        var authResponse = new AuthResponseDTO
        {
            UserId = user.Id,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Token = await GenerateJwtTokenAsync(user.Id),
            Roles = userDTO.Roles,
            Permissions = permissions
        };
        
        return authResponse;
    }

    public async Task<AuthResponseDTO> RegisterAsync(RegisterDTO registerDTO)
    {
        var createUserDTO = new CreateUserDTO
        {
            Username = registerDTO.Username,
            Password = registerDTO.Password,
            Email = registerDTO.Email,
            FirstName = registerDTO.FirstName,
            LastName = registerDTO.LastName
        };
        
        var userDTO = await _userService.CreateAsync(createUserDTO);
        var permissions = await _userService.GetUserPermissionsAsync(userDTO.Id);
        
        var authResponse = new AuthResponseDTO
        {
            UserId = userDTO.Id,
            Username = userDTO.Username,
            FirstName = userDTO.FirstName,
            LastName = userDTO.LastName,
            Email = userDTO.Email,
            Token = await GenerateJwtTokenAsync(userDTO.Id),
            Roles = userDTO.Roles,
            Permissions = permissions
        };
        
        return authResponse;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDTO)
    {
        var user = await _userService.GetUserByUsernameAsync(userId.ToString());
        if (user == null)
        {
            throw AppErrors.UserNotFound;
        }

        if (!await _userService.VerifyPasswordAsync(user, changePasswordDTO.CurrentPassword))
        {
            throw AppErrors.InvalidCurrentPassword;
        }

        if (changePasswordDTO.NewPassword != changePasswordDTO.ConfirmNewPassword)
        {
            throw AppErrors.PasswordMismatch;
        }

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDTO.NewPassword);
        
        return true;
    }

    public async Task<string> GenerateJwtTokenAsync(int userId)
    {
        var user = await _userService.GetByIdAsync(userId);
        var permissions = await _userService.GetUserPermissionsAsync(userId);
        
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, user.Username)
        };
        
        // Add roles as claims
        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }
        
        // Add permissions as claims
        foreach (var permission in permissions)
        {
            claims.Add(new Claim("Permission", permission));
        }
        
        var token = _configuration["JWT:Token"];
        var key = Encoding.ASCII.GetBytes(token);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var securityToken = tokenHandler.CreateToken(tokenDescriptor);
        
        return tokenHandler.WriteToken(securityToken);
    }
} 