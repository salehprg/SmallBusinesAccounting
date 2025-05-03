using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using New_Back.Domain;

namespace New_Back.Models;

public class UserModel : BaseEntity
{
    public string Username { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PasswordHash { get; set; }
    public string Email { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsBanned { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }
    
    // Navigation property
    public ICollection<UserRoleModel> UserRoles { get; set; }
    
    public UserModel()
    {
        UserRoles = new List<UserRoleModel>();
    }
} 