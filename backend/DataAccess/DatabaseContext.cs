using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using New_Back.Models;
using backend.Models;

namespace New_Back.Data;

public class DatabaseContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<UserModel> Users { get; set; }
    public DbSet<RoleModel> Roles { get; set; }
    public DbSet<PermissionModel> Permissions { get; set; }
    public DbSet<UserRoleModel> UserRoles { get; set; }
    public DbSet<RolePermissionModel> RolePermissions { get; set; }
    public DbSet<TransactionModel> Transactions { get; set; }
    public DbSet<PersonModel> Persons { get; set; }
    public DbSet<CostType> CostTypes { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure relationships and constraints
        builder.Entity<UserRoleModel>()
            .HasIndex(ur => new { ur.UserId, ur.RoleId })
            .IsUnique();

        builder.Entity<RolePermissionModel>()
            .HasIndex(rp => new { rp.RoleId, rp.PermissionId })
            .IsUnique();
    }
}