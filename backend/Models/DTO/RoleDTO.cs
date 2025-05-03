namespace backend.Models.DTO;

public class RoleDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public List<PermissionDTO> Permissions { get; set; } = new List<PermissionDTO>();
}

public class CreateRoleDTO
{
    public string Name { get; set; }
    public string Description { get; set; }
    public List<int> PermissionIds { get; set; } = new List<int>();
}

public class UpdateRoleDTO
{
    public string Name { get; set; }
    public string Description { get; set; }
    public List<int> PermissionIds { get; set; } = new List<int>();
}

public class UpdateRolePermissionsDTO
{
    public int RoleId { get; set; }
    public List<int> PermissionIds { get; set; } = new List<int>();
} 