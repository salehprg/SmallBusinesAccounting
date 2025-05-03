using System.ComponentModel.DataAnnotations.Schema;
using New_Back.Domain;

namespace New_Back.Models;

public class RolePermissionModel : BaseEntity
{
    public int RoleId { get; set; }
    
    [ForeignKey("RoleId")]
    public RoleModel Role { get; set; }
    
    public int PermissionId { get; set; }
    
    [ForeignKey("PermissionId")]
    public PermissionModel Permission { get; set; }
} 