using System.Net;
using System.Text.Json;
using New_Back.Exceptions;
using backend.Models.DTO;
using New_Back.Models.API;

namespace New_Back.Middlewares;

public class ErrorHandlerMiddleware
{
    private readonly RequestDelegate _next;

    public ErrorHandlerMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception error)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            int errorCode;
            string developerErrorText;
            string userErrorText;

            switch (error)
            {
                case AppException e:
                    response.StatusCode = (int)HttpStatusCode.OK;
                    errorCode = e.ErrorCode;
                    developerErrorText = e.DeveloperErrorText;
                    userErrorText = e.UserErrorText;
                    break;
                default:
                    response.StatusCode = (int)HttpStatusCode.OK;
                    errorCode = 500;
                    userErrorText = "Server Error";
                    developerErrorText = "500 Internal Server Error :(";
                    Console.WriteLine(error);

                    break;
            }

            var result = JsonSerializer.Serialize(
                    APIResponse<ErrorDTO>.ErrorResult(errorCode, userErrorText, developerErrorText));

            await response.WriteAsync(result);
        }
    }
} 