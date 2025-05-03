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
public class UsersController : MyBaseController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Policy = "Permission:ViewUsers")]
    public async Task<ActionResult<APIResponse<List<UserDTO>>>> GetAllUsers()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Permission:ViewUsers")]
    public async Task<ActionResult<APIResponse<UserDTO>>> GetUserById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return Ok(user);
    }

    [HttpPost]
    [Authorize(Policy = "Permission:CreateUser")]
    public async Task<ActionResult<APIResponse<UserDTO>>> CreateUser([FromBody] CreateUserDTO createUserDTO)
    {
        var user = await _userService.CreateAsync(createUserDTO);
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Permission:EditUser")]
    public async Task<ActionResult<APIResponse<UserDTO>>> UpdateUser(int id, [FromBody] UpdateUserDTO updateUserDTO)
    {
        var user = await _userService.UpdateAsync(id, updateUserDTO);
        return Ok(user);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Permission:DeleteUser")]
    public async Task<ActionResult<APIResponse<bool>>> DeleteUser(int id)
    {
        await _userService.DeleteAsync(id);
        return Ok();
    }

    [HttpPut("roles")]
    [Authorize(Policy = "Permission:EditUser")]
    public async Task<ActionResult<APIResponse<UserDTO>>> UpdateUserRoles([FromBody] UpdateUserRolesDTO updateUserRolesDTO)
    {
        var user = await _userService.UpdateUserRolesAsync(updateUserRolesDTO);
        return Ok(user);
    }

    [HttpGet("me")]
    public async Task<ActionResult<APIResponse<UserDTO>>> GetCurrentUser()
    {

        var user = await _userService.GetByIdAsync(UserId);
        return Ok(user);
    }

    [HttpGet("me/permissions")]
    public async Task<ActionResult<APIResponse<List<string>>>> GetCurrentUserPermissions()
    {

        var permissions = await _userService.GetUserPermissionsAsync(UserId);
        return Ok(permissions);
    }
} 