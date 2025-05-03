using backend.Models.DTO;

namespace New_Back.Models.API;

public class APIResponse<T>
{
    public bool Success { get; set; }
    public int Code { get; set; }
    public string Message { get; set; }
    public string DeveloperMessage { get; set; }
    public T Data { get; set; }

    public static APIResponse<T> SuccessResult(T data)
    {
        return new APIResponse<T>
        {
            Success = true,
            Code = 200,
            Message = "Success",
            DeveloperMessage = "Success",
            Data = data
        };
    }

    public static APIResponse<ErrorDTO> ErrorResult(int code, string userMessage, string developerMessage)
    {
        return new APIResponse<ErrorDTO>
        {
            Success = false,
            Code = code,
            Message = userMessage,
            DeveloperMessage = developerMessage,
            Data = new ErrorDTO
            {
                Error = userMessage
            }
        };
    }
}