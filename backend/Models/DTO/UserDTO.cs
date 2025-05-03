namespace backend.Models.DTO;

public class UserDTO
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public bool IsActive { get; set; }
    public bool IsBanned { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
}

public class CreateUserDTO
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public List<int> RoleIds { get; set; } = new List<int>();
}

public class UpdateUserDTO
{
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsActive { get; set; }
    public bool IsBanned { get; set; }
    public List<int> RoleIds { get; set; } = new List<int>();
}

public class ChangePasswordDTO
{
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmNewPassword { get; set; }
}

public class UpdateUserRolesDTO
{
    public int UserId { get; set; }
    public List<int> RoleIds { get; set; } = new List<int>();
} 