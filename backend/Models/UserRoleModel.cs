using System.ComponentModel.DataAnnotations.Schema;
using New_Back.Domain;

namespace New_Back.Models;

public class UserRoleModel : BaseEntity
{
    public int UserId { get; set; }
    
    [ForeignKey("UserId")]
    public UserModel User { get; set; }
    
    public int RoleId { get; set; }
    
    [ForeignKey("RoleId")]
    public RoleModel Role { get; set; }
} 