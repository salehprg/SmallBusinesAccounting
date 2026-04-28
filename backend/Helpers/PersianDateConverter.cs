using System.Globalization;

namespace backend.Helpers;

public sealed class PersianDateConverter : IPersianDateConverter
{
    private static readonly PersianCalendar PersianCalendar = new();

    public bool TryParse(string? raw, out DateOnly date)
    {
        date = default;
        if (string.IsNullOrWhiteSpace(raw))
        {
            return false;
        }

        var dateStr = raw.Trim();

        if (TryParseJalaliParts(dateStr, out var g))
        {
            date = DateOnly.FromDateTime(g);
            return true;
        }

        if (DateOnly.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
        {
            return true;
        }

        if (DateTime.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
        {
            date = DateOnly.FromDateTime(dt);
            return true;
        }

        return false;
    }

    /// <summary>
    /// Mirrors Python parse_date: split on / - ., if first segment 4 digits assume Y/M/D, if last 4 digits D/M/Y, build Jalali then convert to Gregorian.
    /// </summary>
    private static bool TryParseJalaliParts(string dateStr, out DateTime gregorian)
    {
        gregorian = default;
        if (dateStr.IndexOf('/') < 0 && dateStr.IndexOf('-') < 0 && dateStr.IndexOf('.') < 0)
        {
            return false;
        }

        var normalized = dateStr.Replace('/', '-').Replace('.', '-');
        var parts = normalized.Split('-', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 3)
        {
            return false;
        }

        int y, m, d;
        if (parts[0].Length == 4)
        {
            if (!int.TryParse(parts[0], out y) || !int.TryParse(parts[1], out m) || !int.TryParse(parts[2], out d))
            {
                return false;
            }
        }
        else if (parts[2].Length == 4)
        {
            if (!int.TryParse(parts[0], out d) || !int.TryParse(parts[1], out m) || !int.TryParse(parts[2], out y))
            {
                return false;
            }
        }
        else
        {
            return false;
        }

        // Heuristic: treat as Jalali if year in typical Persian range; otherwise not a Jalali string for this path.
        if (y < 1200 || y > 1600)
        {
            return false;
        }

        try
        {
            gregorian = PersianCalendar.ToDateTime(y, m, d, 0, 0, 0, 0);
            return true;
        }
        catch (ArgumentOutOfRangeException)
        {
            return false;
        }
    }
}
