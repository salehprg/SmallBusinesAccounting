namespace backend.Models.DTO;

public class LoginDTO
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class RegisterDTO
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

public class AuthResponseDTO
{
    public int UserId { get; set; }
    public string Username { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Token { get; set; }
    public List<string> Roles { get; set; }
    public List<string> Permissions { get; set; }
} 