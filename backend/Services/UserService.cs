using AutoMapper;
using backend.Models.DTO;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;
using New_Back.Exceptions;
using New_Back.Models;

namespace backend.Services;

public class UserService : IUserService
{
    private readonly IRepository<UserModel> _userRepository;
    private readonly IRepository<RoleModel> _roleRepository;
    private readonly IRepository<UserRoleModel> _userRoleRepository;
    private readonly IRepository<RolePermissionModel> _rolePermissionRepository;
    private readonly IRepository<PermissionModel> _permissionRepository;
    private readonly IMapper _mapper;

    public UserService(
        IRepository<UserModel> userRepository,
        IRepository<RoleModel> roleRepository,
        IRepository<UserRoleModel> userRoleRepository,
        IRepository<RolePermissionModel> rolePermissionRepository,
        IRepository<PermissionModel> permissionRepository,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _userRoleRepository = userRoleRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _permissionRepository = permissionRepository;
        _mapper = mapper;
    }

    public async Task<UserDTO> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetById(id).FirstOrDefaultAsync();
        if (user == null)
        {
            throw AppErrors.UserNotFound;
        }

        var userDTO = _mapper.Map<UserDTO>(user);
        
        // Get roles
        var userRoles = await _userRoleRepository.GetAll()
            .Include(ur => ur.Role)
            .Where(ur => ur.UserId == id)
            .ToListAsync();
        
        userDTO.Roles = userRoles.Select(ur => ur.Role.Name).ToList();
        
        return userDTO;
    }

    public async Task<List<UserDTO>> GetAllAsync()
    {
        var users = await _userRepository.GetAll().ToListAsync();
        var userDTOs = new List<UserDTO>();
        
        foreach (var user in users)
        {
            var userDTO = _mapper.Map<UserDTO>(user);
            
            // Get roles
            var userRoles = await _userRoleRepository.GetAll()
                .Include(ur => ur.Role)
                .Where(ur => ur.UserId == user.Id)
                .ToListAsync();
            
            userDTO.Roles = userRoles.Select(ur => ur.Role.Name).ToList();
            
            userDTOs.Add(userDTO);
        }
        
        return userDTOs;
    }

    public async Task<UserDTO> CreateAsync(CreateUserDTO createUserDTO)
    {
        // Check if username is already taken
        var existingUser = await _userRepository.GetAll()
            .FirstOrDefaultAsync(u => u.Username == createUserDTO.Username);
        
        if (existingUser != null)
        {
            throw AppErrors.UsernameTaken;
        }

        // Check if email is already taken
        existingUser = await _userRepository.GetAll()
            .FirstOrDefaultAsync(u => u.Email == createUserDTO.Email);
        
        if (existingUser != null)
        {
            throw AppErrors.EmailTaken;
        }

        // Create user
        var user = _mapper.Map<UserModel>(createUserDTO);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDTO.Password);
        
        _userRepository.Add(user);
        
        // Assign roles
        if (createUserDTO.RoleIds?.Count > 0)
        {
            foreach (var roleId in createUserDTO.RoleIds)
            {
                var role = await _roleRepository.GetById(roleId).FirstOrDefaultAsync();
                if (role == null)
                {
                    throw AppErrors.RoleNotFound;
                }

                var userRole = new UserRoleModel
                {
                    UserId = user.Id,
                    RoleId = roleId
                };
                
                _userRoleRepository.Add(userRole);
            }
        }
        
        return await GetByIdAsync(user.Id);
    }

    public async Task<UserDTO> UpdateAsync(int id, UpdateUserDTO updateUserDTO)
    {
        var user = await _userRepository.GetById(id).FirstOrDefaultAsync();
        if (user == null)
        {
            throw AppErrors.UserNotFound;
        }

        // Check if email is already taken by another user
        var existingUser = await _userRepository.GetAll()
            .FirstOrDefaultAsync(u => u.Email == updateUserDTO.Email && u.Id != id);
        
        if (existingUser != null)
        {
            throw AppErrors.EmailTaken;
        }

        // Update user properties
        user.Email = updateUserDTO.Email;
        user.FirstName = updateUserDTO.FirstName;
        user.LastName = updateUserDTO.LastName;
        user.IsActive = updateUserDTO.IsActive;
        user.IsBanned = updateUserDTO.IsBanned;
        
        _userRepository.Edit(user);
        
        // Update roles if provided
        if (updateUserDTO.RoleIds != null)
        {
            // Remove existing roles
            var existingRoles = await _userRoleRepository.GetAll()
                .Where(ur => ur.UserId == id)
                .ToListAsync();
            
            foreach (var existingRole in existingRoles)
            {
                _userRoleRepository.Remove(existingRole);
            }
            
            // Add new roles
            foreach (var roleId in updateUserDTO.RoleIds)
            {
                var role = await _roleRepository.GetById(roleId).FirstOrDefaultAsync();
                if (role == null)
                {
                    throw AppErrors.RoleNotFound;
                }

                var userRole = new UserRoleModel
                {
                    UserId = user.Id,
                    RoleId = roleId
                };
                
                _userRoleRepository.Add(userRole);
            }
        }
        
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _userRepository.GetById(id).FirstOrDefaultAsync();
        if (user == null)
        {
            throw AppErrors.UserNotFound;
        }

        // Delete user roles first
        var userRoles = await _userRoleRepository.GetAll()
            .Where(ur => ur.UserId == id)
            .ToListAsync();
        
        foreach (var userRole in userRoles)
        {
            _userRoleRepository.Remove(userRole);
        }
        
        // Delete user
        _userRepository.Remove(user);
    }

    public async Task<UserDTO> UpdateUserRolesAsync(UpdateUserRolesDTO updateUserRolesDTO)
    {
        var user = await _userRepository.GetById(updateUserRolesDTO.UserId).FirstOrDefaultAsync();
        if (user == null)
        {
            throw AppErrors.UserNotFound;
        }

        // Remove existing roles
        var existingRoles = await _userRoleRepository.GetAll()
            .Where(ur => ur.UserId == updateUserRolesDTO.UserId)
            .ToListAsync();
        
        foreach (var existingRole in existingRoles)
        {
            _userRoleRepository.Remove(existingRole);
        }
        
        // Add new roles
        foreach (var roleId in updateUserRolesDTO.RoleIds)
        {
            var role = await _roleRepository.GetById(roleId).FirstOrDefaultAsync();
            if (role == null)
            {
                throw AppErrors.RoleNotFound;
            }

            var userRole = new UserRoleModel
            {
                UserId = user.Id,
                RoleId = roleId
            };
            
            _userRoleRepository.Add(userRole);
        }
        
        return await GetByIdAsync(updateUserRolesDTO.UserId);
    }

    public async Task<List<string>> GetUserPermissionsAsync(int userId)
    {
        var user = await _userRepository.GetById(userId).FirstOrDefaultAsync();
        if (user == null)
        {
            throw AppErrors.UserNotFound;
        }

        var userRoles = await _userRoleRepository.GetAll()
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.RoleId)
            .ToListAsync();
        
        var rolePermissions = await _rolePermissionRepository.GetAll()
            .Where(rp => userRoles.Contains(rp.RoleId))
            .Select(rp => rp.PermissionId)
            .Distinct()
            .ToListAsync();
        
        var permissions = await _permissionRepository.GetAll()
            .Where(p => rolePermissions.Contains(p.Id))
            .Select(p => p.Name)
            .ToListAsync();
        
        return permissions;
    }

    public async Task<bool> UserHasPermissionAsync(int userId, string permissionName)
    {
        var permissions = await GetUserPermissionsAsync(userId);
        return permissions.Contains(permissionName);
    }

    public async Task<UserModel> GetUserByUsernameAsync(string username)
    {
        var user = await _userRepository.GetAll()
            .FirstOrDefaultAsync(u => u.Username == username);
        
        return user;
    }

    public async Task<bool> VerifyPasswordAsync(UserModel user, string password)
    {
        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }
} 