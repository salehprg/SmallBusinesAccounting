using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using New_Back.Exceptions;
using New_Back.Models;
using New_Back.Models.API;
using System.Security.Claims;
using System.Text.Json;

namespace New_Back.Controllers;

public class MyBaseController : ControllerBase
{
    protected int UserId
    {
        get
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }

    public override OkObjectResult Ok([ActionResultObjectValue] object? value)
    {
        APIResponse<object> aPIResponseModel = new()
        {
            Data = value,
            Code = 200
        };

        return base.Ok(aPIResponseModel);
    }

    protected ActionResult CreatedAtAction<T>(string actionName, object routeValues, APIResponse<T> response)
    {
        return base.CreatedAtAction(actionName, routeValues, response);
    }
}