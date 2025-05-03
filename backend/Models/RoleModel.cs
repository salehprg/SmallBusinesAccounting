using New_Back.Domain;

namespace New_Back.Models;

public class RoleModel : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    
    // Navigation properties
    public ICollection<UserRoleModel> UserRoles { get; set; }
    public ICollection<RolePermissionModel> RolePermissions { get; set; }
    
    public RoleModel()
    {
        UserRoles = new List<UserRoleModel>();
        RolePermissions = new List<RolePermissionModel>();
    }
} 