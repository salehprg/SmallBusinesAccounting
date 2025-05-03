using New_Back.Data;
using New_Back.Models;
using New_Back.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace New_Back.Data;

public static class SeedData
{
    public static async Task SeedDefaultData(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        
        await SeedPermissions(context);
        await SeedRoles(context);
        await SeedAdmin(context);
    }
    
    private static async Task SeedPermissions(DatabaseContext context)
    {
        if (await context.Permissions.AnyAsync())
        {
            return; // Permissions already seeded
        }
        
        var permissions = Enum.GetValues(typeof(PermissionType))
            .Cast<PermissionType>()
            .Select(p => new PermissionModel
            {
                Name = p.ToString(),
                Description = GetPermissionDescription(p)
            })
            .ToList();
        
        await context.Permissions.AddRangeAsync(permissions);
        await context.SaveChangesAsync();
    }
    
    private static async Task SeedRoles(DatabaseContext context)
    {
        if (await context.Roles.AnyAsync())
        {
            return; // Roles already seeded
        }
        
        // Create Admin role
        var adminRole = new RoleModel
        {
            Name = "Admin",
            Description = "System administrator with full access"
        };
        
        await context.Roles.AddAsync(adminRole);
        await context.SaveChangesAsync();
        
        // Assign all permissions to Admin role
        var permissions = await context.Permissions.ToListAsync();
        
        foreach (var permission in permissions)
        {
            var rolePermission = new RolePermissionModel
            {
                RoleId = adminRole.Id,
                PermissionId = permission.Id
            };
            
            await context.RolePermissions.AddAsync(rolePermission);
        }
        
        // Create User role
        var userRole = new RoleModel
        {
            Name = "User",
            Description = "Regular user with limited access"
        };
        
        await context.Roles.AddAsync(userRole);
        await context.SaveChangesAsync();
        
        // Assign basic permissions to User role
        var userPermissions = new[] 
        {
            PermissionType.ViewTransactions.ToString(),
            PermissionType.CreateTransaction.ToString(),
            PermissionType.ViewPersons.ToString(),
            PermissionType.ViewCostTypes.ToString()
        };
        
        var userPermissionIds = await context.Permissions
            .Where(p => userPermissions.Contains(p.Name))
            .Select(p => p.Id)
            .ToListAsync();
        
        foreach (var permissionId in userPermissionIds)
        {
            var rolePermission = new RolePermissionModel
            {
                RoleId = userRole.Id,
                PermissionId = permissionId
            };
            
            await context.RolePermissions.AddAsync(rolePermission);
        }
        
        await context.SaveChangesAsync();
    }
    
    private static async Task SeedAdmin(DatabaseContext context)
    {
        if (await context.Users.AnyAsync(u => u.Username == "admin"))
        {
            return; // Admin already seeded
        }
        
        // Create admin user
        var adminUser = new UserModel
        {
            Username = "admin",
            Email = "admin@example.com",
            FirstName = "System",
            LastName = "Administrator",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        
        await context.Users.AddAsync(adminUser);
        await context.SaveChangesAsync();
        
        // Assign Admin role to admin user
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        
        if (adminRole != null)
        {
            var userRole = new UserRoleModel
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            };
            
            await context.UserRoles.AddAsync(userRole);
            await context.SaveChangesAsync();
        }
    }
    
    private static string GetPermissionDescription(PermissionType permissionType)
    {
        return permissionType switch
        {
            // Transaction permissions
            PermissionType.ViewTransactions => "Can view all transactions",
            PermissionType.CreateTransaction => "Can create new transactions",
            PermissionType.EditTransaction => "Can edit existing transactions",
            PermissionType.DeleteTransaction => "Can delete transactions",
            
            // Person permissions
            PermissionType.ViewPersons => "Can view all persons",
            PermissionType.CreatePerson => "Can create new persons",
            PermissionType.EditPerson => "Can edit existing persons",
            PermissionType.DeletePerson => "Can delete persons",
            
            // Cost Type permissions
            PermissionType.ViewCostTypes => "Can view all cost types",
            PermissionType.CreateCostType => "Can create new cost types",
            PermissionType.EditCostType => "Can edit existing cost types",
            PermissionType.DeleteCostType => "Can delete cost types",
            
            // User management permissions
            PermissionType.ViewUsers => "Can view all users",
            PermissionType.CreateUser => "Can create new users",
            PermissionType.EditUser => "Can edit existing users",
            PermissionType.DeleteUser => "Can delete users",
            
            // Role management permissions
            PermissionType.ViewRoles => "Can view all roles",
            PermissionType.CreateRole => "Can create new roles",
            PermissionType.EditRole => "Can edit existing roles",
            PermissionType.DeleteRole => "Can delete roles",
            
            // Admin permissions
            PermissionType.ManagePermissions => "Can manage permissions",
            PermissionType.SystemSettings => "Can manage system settings",
            
            _ => "No description"
        };
    }
} 