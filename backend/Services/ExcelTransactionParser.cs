using System.Globalization;
using System.Text;
using ExcelDataReader;
using New_Back.Exceptions;

namespace backend.Services;

public sealed class ExcelTransactionParser : IExcelTransactionParser
{
    public List<RawExcelRow> Parse(Stream stream, string? fileName)
    {
        if (stream == null || !stream.CanRead)
        {
            throw AppErrors.InvalidExcelFile;
        }

        try
        {
            // Needed for legacy .xls encodings (BIFF8, etc.)
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            if (stream.CanSeek)
            {
                stream.Position = 0;
            }

            using var reader = CreateReader(stream, fileName);

            // First sheet only
            var result = new List<RawExcelRow>();

            for (int i = 0; i < 8; i++)
            {
                if (!reader.Read())
                {
                    return [];
                }
            }

            while (reader.Read())
            {
                // Fixed schema (Python): 0=row,1=date,2=description,3=card_holder,4=deposit,5=withdrawal,6=card_number
                var statementRow = GetInt(reader, 0, defaultValue: result.Count + 2);
                var dateText = GetDateText(reader, 1);
                var description = GetString(reader, 4) ?? string.Empty;
                var deposit = GetDecimal(reader, 5);
                var withdrawal = GetDecimal(reader, 6);

                // Consider row empty if all meaningful fields are empty/zero
                if (string.IsNullOrWhiteSpace(dateText)
                    && string.IsNullOrWhiteSpace(description)
                    && deposit == 0m
                    && withdrawal == 0m)
                {
                    continue;
                }

                result.Add(new RawExcelRow(
                    statementRow,
                    dateText,
                    description.Trim(),
                    deposit,
                    withdrawal));
            }

            return result;
        }
        catch (AppException)
        {
            throw;
        }
        catch
        {
            throw AppErrors.InvalidExcelFile;
        }
    }

    private static IExcelDataReader CreateReader(Stream stream, string? fileName)
    {
        // ExcelDataReader can infer format from fileName extension; fallback to auto-detect.
        var ext = Path.GetExtension(fileName ?? string.Empty);
        if (ext.Equals(".xls", StringComparison.OrdinalIgnoreCase))
        {
            return ExcelReaderFactory.CreateBinaryReader(stream);
        }

        if (ext.Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            return ExcelReaderFactory.CreateOpenXmlReader(stream);
        }

        return ExcelReaderFactory.CreateReader(stream);
    }

    private static object? GetObject(IExcelDataReader reader, int i)
    {
        if (i < 0 || i >= reader.FieldCount)
        {
            return null;
        }

        return reader.IsDBNull(i) ? null : reader.GetValue(i);
    }

    private static string? GetString(IExcelDataReader reader, int i)
    {
        var o = GetObject(reader, i);
        return o switch
        {
            null => null,
            DateTime dt => dt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            _ => o.ToString()?.Trim()
        };
    }

    private static int GetInt(IExcelDataReader reader, int i, int defaultValue)
    {
        var o = GetObject(reader, i);
        if (o == null)
        {
            return defaultValue;
        }

        if (o is double d)
        {
            return (int)Math.Round(d, MidpointRounding.AwayFromZero);
        }

        if (o is int n)
        {
            return n;
        }

        return int.TryParse(o.ToString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed) ? parsed : defaultValue;
    }

    private static decimal GetDecimal(IExcelDataReader reader, int i)
    {
        var o = GetObject(reader, i);
        if (o == null)
        {
            return 0m;
        }

        return o switch
        {
            double d => (decimal)d,
            float f => (decimal)f,
            decimal m => m,
            int n => n,
            long l => l,
            _ => decimal.TryParse(o.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed) ? parsed : 0m
        };
    }

    private static string? GetDateText(IExcelDataReader reader, int i)
    {
        var o = GetObject(reader, i);
        if (o == null)
        {
            return null;
        }

        if (o is DateTime dt)
        {
            return dt.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        if (o is double serial and >= 20000 and <= 80000)
        {
            try
            {
                return DateTime.FromOADate(serial).Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            }
            catch (ArgumentException)
            {
                // fallback to string
            }
        }

        var t = o.ToString()?.Trim();
        return string.IsNullOrEmpty(t) ? null : t;
    }

    private static string? NormalizeAccountDigits(object? o)
    {
        if (o == null)
        {
            return null;
        }

        var raw = o switch
        {
            double d => ((long)Math.Round(d, MidpointRounding.AwayFromZero)).ToString(CultureInfo.InvariantCulture),
            _ => o.ToString()?.Trim() ?? string.Empty
        };

        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        var digits = new string(raw.Where(char.IsDigit).ToArray());
        return string.IsNullOrEmpty(digits) ? null : digits;
    }
}
