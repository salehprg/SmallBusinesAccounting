using AutoMapper;
using backend.Models.DTO;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;
using New_Back.Exceptions;
using New_Back.Models;

namespace backend.Services;

public class RoleService : IRoleService
{
    private readonly IRepository<RoleModel> _roleRepository;
    private readonly IRepository<PermissionModel> _permissionRepository;
    private readonly IRepository<UserRoleModel> _userRoleRepository;
    private readonly IRepository<RolePermissionModel> _rolePermissionRepository;
    private readonly IMapper _mapper;

    public RoleService(
        IRepository<RoleModel> roleRepository,
        IRepository<PermissionModel> permissionRepository,
        IRepository<UserRoleModel> userRoleRepository,
        IRepository<RolePermissionModel> rolePermissionRepository,
        IMapper mapper)
    {
        _roleRepository = roleRepository;
        _permissionRepository = permissionRepository;
        _userRoleRepository = userRoleRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _mapper = mapper;
    }

    public async Task<RoleDTO> GetByIdAsync(int id)
    {
        var role = await _roleRepository.GetById(id).FirstOrDefaultAsync();
        if (role == null)
        {
            throw AppErrors.RoleNotFound;
        }

        var roleDTO = _mapper.Map<RoleDTO>(role);
        
        // Get permissions
        var rolePermissions = await _rolePermissionRepository.GetAll()
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == id)
            .ToListAsync();
        
        roleDTO.Permissions = rolePermissions
            .Select(rp => _mapper.Map<PermissionDTO>(rp.Permission))
            .ToList();
        
        return roleDTO;
    }

    public async Task<List<RoleDTO>> GetAllAsync()
    {
        var roles = await _roleRepository.GetAll().ToListAsync();
        var roleDTOs = new List<RoleDTO>();
        
        foreach (var role in roles)
        {
            var roleDTO = _mapper.Map<RoleDTO>(role);
            
            // Get permissions
            var rolePermissions = await _rolePermissionRepository.GetAll()
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == role.Id)
                .ToListAsync();
            
            roleDTO.Permissions = rolePermissions
                .Select(rp => _mapper.Map<PermissionDTO>(rp.Permission))
                .ToList();
            
            roleDTOs.Add(roleDTO);
        }
        
        return roleDTOs;
    }

    public async Task<RoleDTO> CreateAsync(CreateRoleDTO createRoleDTO)
    {
        // Check if role name already exists
        var existingRole = await _roleRepository.GetAll()
            .FirstOrDefaultAsync(r => r.Name == createRoleDTO.Name);
        
        if (existingRole != null)
        {
            throw AppErrors.RoleNameTaken;
        }

        // Create role
        var role = new RoleModel
        {
            Name = createRoleDTO.Name,
            Description = createRoleDTO.Description
        };
        
        _roleRepository.Add(role);
        
        // Assign permissions
        if (createRoleDTO.PermissionIds?.Count > 0)
        {
            foreach (var permissionId in createRoleDTO.PermissionIds)
            {
                var permission = await _permissionRepository.GetById(permissionId).FirstOrDefaultAsync();
                if (permission == null)
                {
                    throw AppErrors.PermissionNotFound;
                }

                var rolePermission = new RolePermissionModel
                {
                    RoleId = role.Id,
                    PermissionId = permissionId
                };
                
                _rolePermissionRepository.Add(rolePermission);
            }
        }
        
        return await GetByIdAsync(role.Id);
    }

    public async Task<RoleDTO> UpdateAsync(int id, UpdateRoleDTO updateRoleDTO)
    {
        var role = await _roleRepository.GetById(id).FirstOrDefaultAsync();
        if (role == null)
        {
            throw AppErrors.RoleNotFound;
        }

        // Check if role name already exists
        var existingRole = await _roleRepository.GetAll()
            .FirstOrDefaultAsync(r => r.Name == updateRoleDTO.Name && r.Id != id);
        
        if (existingRole != null)
        {
            throw AppErrors.RoleNameTaken;
        }

        // Update role
        role.Name = updateRoleDTO.Name;
        role.Description = updateRoleDTO.Description;
        
        _roleRepository.Edit(role);
        
        // Update permissions if provided
        if (updateRoleDTO.PermissionIds != null)
        {
            await UpdateRolePermissionsAsync(new UpdateRolePermissionsDTO
            {
                RoleId = id,
                PermissionIds = updateRoleDTO.PermissionIds
            });
        }
        
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var role = await _roleRepository.GetById(id).FirstOrDefaultAsync();
        if (role == null)
        {
            throw AppErrors.RoleNotFound;
        }

        // Check if role is assigned to any users
        var hasUsers = await _userRoleRepository.GetAll()
            .AnyAsync(ur => ur.RoleId == id);
        
        if (hasUsers)
        {
            throw AppErrors.RoleInUse;
        }

        // Delete role permissions first
        var rolePermissions = await _rolePermissionRepository.GetAll()
            .Where(rp => rp.RoleId == id)
            .ToListAsync();
        
        foreach (var rolePermission in rolePermissions)
        {
            _rolePermissionRepository.Remove(rolePermission);
        }
        
        // Delete role
        _roleRepository.Remove(role);
    }

    public async Task<RoleDTO> UpdateRolePermissionsAsync(UpdateRolePermissionsDTO updateRolePermissionsDTO)
    {
        var role = await _roleRepository.GetById(updateRolePermissionsDTO.RoleId).FirstOrDefaultAsync();
        if (role == null)
        {
            throw AppErrors.RoleNotFound;
        }

        // Remove existing permissions
        var existingPermissions = await _rolePermissionRepository.GetAll()
            .Where(rp => rp.RoleId == updateRolePermissionsDTO.RoleId)
            .ToListAsync();
        
        foreach (var existingPermission in existingPermissions)
        {
            _rolePermissionRepository.Remove(existingPermission);
        }
        
        // Add new permissions
        foreach (var permissionId in updateRolePermissionsDTO.PermissionIds)
        {
            var permission = await _permissionRepository.GetById(permissionId).FirstOrDefaultAsync();
            if (permission == null)
            {
                throw AppErrors.PermissionNotFound;
            }

            var rolePermission = new RolePermissionModel
            {
                RoleId = role.Id,
                PermissionId = permissionId
            };
            
            _rolePermissionRepository.Add(rolePermission);
        }
        
        return await GetByIdAsync(updateRolePermissionsDTO.RoleId);
    }
} 