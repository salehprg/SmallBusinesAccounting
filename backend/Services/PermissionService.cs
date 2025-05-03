using AutoMapper;
using backend.Models.DTO;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;
using New_Back.Exceptions;
using New_Back.Models;
using New_Back.Models.Enums;

namespace backend.Services;

public class PermissionService : IPermissionService
{
    private readonly IRepository<PermissionModel> _permissionRepository;
    private readonly IRepository<RolePermissionModel> _rolePermissionRepository;
    private readonly IMapper _mapper;

    public PermissionService(
        IRepository<PermissionModel> permissionRepository,
        IRepository<RolePermissionModel> rolePermissionRepository,
        IMapper mapper)
    {
        _permissionRepository = permissionRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _mapper = mapper;
    }

    public async Task<PermissionDTO> GetByIdAsync(int id)
    {
        var permission = await _permissionRepository.GetById(id).FirstOrDefaultAsync();
        if (permission == null)
        {
            throw AppErrors.PermissionNotFound;
        }

        return _mapper.Map<PermissionDTO>(permission);
    }

    public async Task<List<PermissionDTO>> GetAllAsync()
    {
        var permissions = await _permissionRepository.GetAll().ToListAsync();
        return _mapper.Map<List<PermissionDTO>>(permissions);
    }

    public async Task<PermissionDTO> CreateAsync(PermissionDTO createDTO)
    {
        var permission = _mapper.Map<PermissionModel>(createDTO);
        _permissionRepository.Add(permission);

        return _mapper.Map<PermissionDTO>(permission);
    }

    public async Task<PermissionDTO> UpdateAsync(int id, PermissionDTO updateDTO)
    {
        var permission = await _permissionRepository.GetById(id).FirstOrDefaultAsync();
        if (permission == null)
        {
            throw AppErrors.PermissionNotFound;
        }

        permission.Name = updateDTO.Name;
        permission.Description = updateDTO.Description;
        
        _permissionRepository.Edit(permission);

        return _mapper.Map<PermissionDTO>(permission);
    }

    public async Task DeleteAsync(int id)
    {
        var permission = await _permissionRepository.GetById(id).FirstOrDefaultAsync();
        if (permission == null)
        {
            throw AppErrors.PermissionNotFound;
        }

        // Check if permission is used in any roles
        var inUse = await _rolePermissionRepository.GetAll()
            .AnyAsync(rp => rp.PermissionId == id);
        
        if (inUse)
        {
            throw AppErrors.PermissionInUse;
        }

        _permissionRepository.Remove(permission);
    }

    public async Task SeedDefaultPermissionsAsync()
    {
        // Get existing permissions
        var existingPermissions = await _permissionRepository.GetAll().Select(p => p.Name).ToListAsync();
        
        // Create list of default permissions from PermissionType enum
        var permissionTypes = Enum.GetValues(typeof(PermissionType))
            .Cast<PermissionType>()
            .Select(p => new { Name = p.ToString(), Description = GetPermissionDescription(p) });
        
        foreach (var permissionType in permissionTypes)
        {
            if (!existingPermissions.Contains(permissionType.Name))
            {
                var permission = new PermissionModel
                {
                    Name = permissionType.Name,
                    Description = permissionType.Description
                };
                
                _permissionRepository.Add(permission);
            }
        }
    }
    
    private string GetPermissionDescription(PermissionType permissionType)
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