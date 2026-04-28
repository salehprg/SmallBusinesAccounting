using backend.Helpers;
using backend.Models;
using backend.Models.DTO;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;

namespace backend.Services;

public sealed class TransactionImportService : ITransactionImportService
{
    private readonly IExcelTransactionParser _excelParser;
    private readonly IPersianDateConverter _dateConverter;
    private readonly IRepository<PersonModel> _personRepository;
    private readonly IRepository<TransactionModel> _transactionRepository;
    private readonly IRepository<CostType> _costTypeRepository;

    public TransactionImportService(
        IExcelTransactionParser excelParser,
        IPersianDateConverter dateConverter,
        IRepository<PersonModel> personRepository,
        IRepository<TransactionModel> transactionRepository,
        IRepository<CostType> costTypeRepository)
    {
        _excelParser = excelParser;
        _dateConverter = dateConverter;
        _personRepository = personRepository;
        _transactionRepository = transactionRepository;
        _costTypeRepository = costTypeRepository;
    }

    public async Task<BulkTransactionPreviewResponseDTO> PreviewAsync(Stream excelStream, string? fileName)
    {
        var rawRows = _excelParser.Parse(excelStream, fileName);
        if (rawRows.Count == 0)
        {
            throw AppErrors.BulkImportEmptyFile;
        }

        var persons = await _personRepository.GetAll().AsNoTracking().ToListAsync();
        var personByAccountDigits = BuildPersonLookup(persons);

        var previewRows = new List<BulkTransactionPreviewRowDTO>();
        var previewValidRows = new List<BulkTransactionPreviewRowDTO>();
        foreach (var raw in rawRows)
        {
            var previewRow = MapPreviewRow(raw, personByAccountDigits);
            previewRows.Add(previewRow);
            if (previewRow.IsValid)
            {
                previewValidRows.Add(previewRow);
            }
        }

        var valid = previewRows.Count(r => r.IsValid);
        return new BulkTransactionPreviewResponseDTO
        {
            TotalRows = previewRows.Count,
            ValidRowsCount = valid,
            InvalidRowsCount = previewRows.Count - valid,
            ValidRows = previewValidRows,
            Rows = previewRows
        };
    }

    public async Task<BulkTransactionImportResultDTO> CommitAsync(BulkTransactionImportRequestDTO request)
    {
        if (request.Rows == null || request.Rows.Count == 0)
        {
            throw AppErrors.BulkImportInvalidRows("No rows to import.");
        }

        var validationErrors = new List<string>();
        foreach (var row in request.Rows)
        {
            validationErrors.AddRange(ValidateCommitRow(row));
        }

        var distinctCostTypeIds = request.Rows.SelectMany(r => r.CostTypes ?? []).Distinct().ToList();
        if (distinctCostTypeIds.Count > 0)
        {
            var existing = await _costTypeRepository.GetAll()
                .Where(ct => distinctCostTypeIds.Contains(ct.Id))
                .Select(ct => ct.Id)
                .ToListAsync();
            if (existing.Count != distinctCostTypeIds.Count)
            {
                validationErrors.Add("One or more cost type IDs do not exist.");
            }
        }

        var personIds = request.Rows.Where(r => r.PersonId.HasValue).Select(r => r.PersonId!.Value).Distinct().ToList();
        if (personIds.Count > 0)
        {
            var existingPersonIds = await _personRepository.GetAll()
                .Where(p => personIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();
            if (existingPersonIds.Count != personIds.Count)
            {
                validationErrors.Add("One or more person IDs do not exist.");
            }
        }

        if (validationErrors.Count > 0)
        {
            throw AppErrors.BulkImportInvalidRows(string.Join(" | ", validationErrors.Distinct()));
        }

        var now = DateTime.UtcNow;
        var entities = new List<TransactionModel>();
        foreach (var row in request.Rows)
        {
            var costTypes = row.CostTypes ?? [];
            var transaction = new TransactionModel
            {
                Name = row.Name,
                Description = row.Description ?? string.Empty,
                Amount = row.Amount,
                IsCash = row.IsCash,
                Date = row.Date,
                TransactionType = row.TransactionType,
                PersonId = row.PersonId,
                SubmitDate = now,
                CostTypes = []
            };

            foreach (var ctId in costTypes)
            {
                transaction.CostTypes.Add(new TransactionCostTypeModel
                {
                    CostTypeId = ctId
                });
            }

            entities.Add(transaction);
        }

        _transactionRepository.StartTransaction();
        try
        {
            _transactionRepository.AddRange(entities);
            _transactionRepository.CommitTransaction();
        }
        catch
        {
            _transactionRepository.RollbackTransaction();
            throw;
        }

        return new BulkTransactionImportResultDTO
        {
            InsertedCount = entities.Count,
            InsertedTransactionIds = entities.Select(e => e.Id).ToList()
        };
    }

    private static Dictionary<string, PersonModel> BuildPersonLookup(List<PersonModel> persons)
    {
        var map = new Dictionary<string, PersonModel>(StringComparer.Ordinal);
        foreach (var p in persons)
        {
            var digits = NormalizeAccountDigits(p.AccountNumber);
            if (digits == null)
            {
                continue;
            }

            map.TryAdd(digits, p);
        }

        return map;
    }

    private BulkTransactionPreviewRowDTO MapPreviewRow(RawExcelRow raw, IReadOnlyDictionary<string, PersonModel> personByAccountDigits)
    {
        var errors = new List<string>();
        var dto = new BulkTransactionPreviewRowDTO
        {
            RowNumber = raw.StatementRowNumber,
            Description = raw.Description,
            IsCash = false
        };

        if (raw.Deposit > 0m && raw.Withdrawal > 0m)
        {
            errors.Add("Both deposit and withdrawal are greater than zero.");
        }
        else if (raw.Deposit <= 0m && raw.Withdrawal <= 0m)
        {
            errors.Add("No positive deposit or withdrawal amount.");
        }
        else if (raw.Deposit > 0m)
        {
            dto.TransactionType = TransactionType.Income;
            dto.Amount = raw.Deposit;
        }
        else
        {
            dto.TransactionType = TransactionType.Expense;
            dto.Amount = raw.Withdrawal;
        }

        if (!_dateConverter.TryParse(raw.DateText, out var date))
        {
            errors.Add("Could not parse date.");
        }
        else
        {
            dto.Date = date;
        }

        dto.Name = raw.Description.Trim();

        dto.PersonId = null;
        dto.PersonName = null;


        dto.IsValid = errors.Count == 0 && dto.TransactionType.HasValue && dto.Amount > 0m;
        if (!dto.IsValid && dto.Amount <= 0m && errors.All(e => !e.Contains("amount", StringComparison.OrdinalIgnoreCase)))
        {
            errors.Add("Invalid transaction amount.");
        }

        dto.Errors = errors;
        return dto;
    }

    private static List<string> ValidateCommitRow(BulkTransactionImportRowDTO row)
    {
        var errors = new List<string>();
        if (row.Amount <= 0m)
        {
            errors.Add($"Row {row.RowNumber}: amount must be greater than zero.");
        }

        if (row.TransactionType != TransactionType.Income && row.TransactionType != TransactionType.Expense)
        {
            errors.Add($"Row {row.RowNumber}: invalid transaction type.");
        }

        if (row.Date == default)
        {
            errors.Add($"Row {row.RowNumber}: date is required.");
        }

        return errors;
    }

    private static string? NormalizeAccountDigits(string? accountNumber)
    {
        if (string.IsNullOrWhiteSpace(accountNumber))
        {
            return null;
        }

        var digits = new string(accountNumber.Where(char.IsDigit).ToArray());
        return string.IsNullOrEmpty(digits) ? null : digits;
    }
}
