using backend.Models.DTO;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using New_Back.Controllers;
using New_Back.Models.API;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : MyBaseController
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    [Authorize(Policy = "Permission:ViewRoles")]
    public async Task<ActionResult<APIResponse<List<RoleDTO>>>> GetAllRoles()
    {
        var roles = await _roleService.GetAllAsync();
        return Ok(roles);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Permission:ViewRoles")]
    public async Task<ActionResult<APIResponse<RoleDTO>>> GetRoleById(int id)
    {
        var role = await _roleService.GetByIdAsync(id);
        return Ok(role);
    }

    [HttpPost]
    [Authorize(Policy = "Permission:CreateRole")]
    public async Task<ActionResult<APIResponse<RoleDTO>>> CreateRole([FromBody] CreateRoleDTO createRoleDTO)
    {
        var role = await _roleService.CreateAsync(createRoleDTO);
        return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, role);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Permission:EditRole")]
    public async Task<ActionResult<APIResponse<RoleDTO>>> UpdateRole(int id, [FromBody] UpdateRoleDTO updateRoleDTO)
    {
        var role = await _roleService.UpdateAsync(id, updateRoleDTO);
        return Ok(role);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Permission:DeleteRole")]
    public async Task<ActionResult<APIResponse<bool>>> DeleteRole(int id)
    {
        await _roleService.DeleteAsync(id);
        return Ok();
    }

    [HttpPut("permissions")]
    [Authorize(Policy = "Permission:EditRole")]
    public async Task<ActionResult<APIResponse<RoleDTO>>> UpdateRolePermissions([FromBody] UpdateRolePermissionsDTO updateRolePermissionsDTO)
    {
        var role = await _roleService.UpdateRolePermissionsAsync(updateRolePermissionsDTO);
        return Ok(role);
    }
} 