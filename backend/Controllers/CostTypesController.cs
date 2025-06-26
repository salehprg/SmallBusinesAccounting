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
public class CostTypesController : MyBaseController
{
    private readonly ICostTypeService _costTypeService;

    public CostTypesController(ICostTypeService costTypeService)
    {
        _costTypeService = costTypeService;
    }

    [HttpGet]
    [Authorize(Policy = "Permission:ViewCostTypes")]
    public async Task<ActionResult<APIResponse<List<CostTypeDTO>>>> GetAllCostTypes()
    {
        var costTypes = await _costTypeService.GetAllCostTypesAsync();
        return Ok(costTypes);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Permission:ViewCostTypes")]
    public async Task<ActionResult<APIResponse<CostTypeDTO>>> GetCostTypeById(int id)
    {
        var costType = await _costTypeService.GetCostTypeByIdAsync(id);
        return Ok(costType);
    }

    [HttpPost]
    [Authorize(Policy = "Permission:CreateCostType")]
    public async Task<ActionResult<APIResponse<CostTypeDTO>>> CreateCostType([FromBody] CreateCostTypeDTO createCostTypeDTO)
    {
        var costType = await _costTypeService.CreateCostTypeAsync(createCostTypeDTO);
        return Ok(true);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Permission:EditCostType")]
    public async Task<ActionResult<APIResponse<CostTypeDTO>>> UpdateCostType(int id, [FromBody] CreateCostTypeDTO updateCostTypeDTO)
    {
        var costType = await _costTypeService.UpdateCostTypeAsync(id, updateCostTypeDTO);
        return Ok(costType);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Permission:DeleteCostType")]
    public async Task<ActionResult> DeleteCostType(int id)
    {
        await _costTypeService.DeleteCostTypeAsync(id);
        return Ok(true);
    }
} 