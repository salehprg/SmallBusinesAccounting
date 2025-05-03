using System.Net;

namespace New_Back.Exceptions;

public class AppException : Exception
{
    public int ErrorCode { get; }
    public string UserErrorText { get; }
    public string DeveloperErrorText { get; }

    public AppException(int errorCode, string developerErrorText, string userErrorText)
        : base(developerErrorText)
    {
        ErrorCode = errorCode;
        UserErrorText = userErrorText;
        DeveloperErrorText = developerErrorText;
    }
}