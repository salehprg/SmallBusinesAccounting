using New_Back.Domain;

namespace New_Back.Models;

public class PermissionModel : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    
    // Navigation property
    public ICollection<RolePermissionModel> RolePermissions { get; set; }
    
    public PermissionModel()
    {
        RolePermissions = new List<RolePermissionModel>();
    }
} 