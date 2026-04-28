namespace backend.Helpers;

/// <summary>
/// Parses Jalali (Persian) and Gregorian date strings into <see cref="DateOnly"/>.
/// </summary>
public interface IPersianDateConverter
{
    /// <summary>
    /// Tries to parse a trimmed date string (Jalali y/m/d variants, then Gregorian).
    /// </summary>
    bool TryParse(string? raw, out DateOnly date);
}
