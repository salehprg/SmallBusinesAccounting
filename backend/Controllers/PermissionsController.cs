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
public class PermissionsController : MyBaseController
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    [HttpGet]
    [Authorize(Policy = "Permission:ManagePermissions")]
    public async Task<ActionResult<APIResponse<List<PermissionDTO>>>> GetAllPermissions()
    {
        var permissions = await _permissionService.GetAllAsync();
        return Ok(permissions);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Permission:ManagePermissions")]
    public async Task<ActionResult<APIResponse<PermissionDTO>>> GetPermissionById(int id)
    {
        var permission = await _permissionService.GetByIdAsync(id);
        return Ok(permission);
    }

    [HttpPost]
    [Authorize(Policy = "Permission:ManagePermissions")]
    public async Task<ActionResult<APIResponse<PermissionDTO>>> CreatePermission([FromBody] PermissionDTO createDTO)
    {
        var permission = await _permissionService.CreateAsync(createDTO);
        return CreatedAtAction(nameof(GetPermissionById), new { id = permission.Id }, permission);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Permission:ManagePermissions")]
    public async Task<ActionResult<APIResponse<PermissionDTO>>> UpdatePermission(int id, [FromBody] PermissionDTO updateDTO)
    {
        var permission = await _permissionService.UpdateAsync(id, updateDTO);
        return Ok(permission);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Permission:ManagePermissions")]
    public async Task<ActionResult<APIResponse<bool>>> DeletePermission(int id)
    {
        await _permissionService.DeleteAsync(id);
        return Ok();
    }
} 