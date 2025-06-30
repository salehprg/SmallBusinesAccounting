using AutoMapper;
using backend.Models;
using backend.Models.DTO;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;
using New_Back.Exceptions;
using Omu.ValueInjecter;

namespace backend.Services;

public class TransactionService : ITransactionService
{
    private readonly IRepository<TransactionModel> _transactionRepository;
    private readonly IRepository<CostType> _costTypeRepository;
    private readonly IRepository<PersonModel> _personRepository;
    private readonly IMapper _mapper;

    public TransactionService(
        IRepository<TransactionModel> transactionRepository,
        IRepository<CostType> costTypeRepository,
        IRepository<PersonModel> personRepository,
        IMapper mapper)
    {
        _transactionRepository = transactionRepository;
        _costTypeRepository = costTypeRepository;
        _personRepository = personRepository;
        _mapper = mapper;
    }

    public async Task<TransactionDTO> CreateTransactionAsync(CreateTransactionDTO createTransactionDTO)
    {
        // Validate amount
        if (createTransactionDTO.Amount <= 0)
        {
            throw AppErrors.InvalidTransactionAmount;
        }

        // Validate cost type existence
        if (createTransactionDTO.CostTypes != null)
        {
            foreach (var costTypeId in createTransactionDTO.CostTypes)
            {
                var costType = await _costTypeRepository.GetById(costTypeId).FirstOrDefaultAsync() ?? throw AppErrors.CostTypeNotFound;
            }
        }

        // Validate person existence if provided
        if (createTransactionDTO.PersonId.HasValue)
        {
            var person = await _personRepository.GetById(createTransactionDTO.PersonId.Value).FirstOrDefaultAsync();
            if (person == null)
            {
                throw AppErrors.PersonNotFound;
            }
        }

        TransactionModel transaction = new()
        {
            Amount = createTransactionDTO.Amount,
            Date = createTransactionDTO.Date,
            Name = createTransactionDTO.Name,
            TransactionType = createTransactionDTO.TransactionType,
            PersonId = createTransactionDTO.PersonId,
            Description = createTransactionDTO.Description,
            IsCash = createTransactionDTO.IsCash
        };

        transaction.SubmitDate = DateTime.UtcNow;
        _transactionRepository.Add(transaction);

        foreach (var newCostType in createTransactionDTO.CostTypes)
        {
            transaction.CostTypes.Add(new TransactionCostTypeModel
            {
                TransactionId = transaction.Id,
                CostTypeId = newCostType
            });
        }
        _transactionRepository.Edit(transaction);

        return await GetTransactionByIdAsync(transaction.Id);
    }

    public async Task<TransactionDTO> GetTransactionByIdAsync(int id)
    {
        var transaction = await _transactionRepository.GetAll()
            .Include(t => t.CostTypes)
            .Include(t => t.Person)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaction == null)
        {
            throw AppErrors.TransactionNotFound;
        }

        var transactionDto = _mapper.Map<TransactionDTO>(transaction);
        return transactionDto;
    }

    public async Task<List<TransactionDTO>> GetAllTransactionsAsync()
    {
        var transactions = await _transactionRepository.GetAll()
            .Include(t => t.CostTypes)
            .Include(t => t.Person)
            .ToListAsync();

        return _mapper.Map<List<TransactionDTO>>(transactions);
    }

    public async Task<List<TransactionDTO>> GetTransactionsByQueryAsync(TransactionQueryDTO queryDTO)
    {
        if (queryDTO.StartDate.HasValue && queryDTO.EndDate.HasValue && queryDTO.StartDate > queryDTO.EndDate)
        {
            throw AppErrors.InvalidDateRange;
        }

        var query = _transactionRepository.GetAll()
            .Include(t => t.CostTypes)
            .ThenInclude(x => x.CostType)
            .Include(t => t.Person)
            .AsQueryable();

        // Apply filters
        if (queryDTO.IsCash.HasValue)
        {
            query = query.Where(t => t.IsCash == queryDTO.IsCash.Value);
        }

        if (queryDTO.StartDate.HasValue)
        {
            query = query.Where(t => t.Date >= queryDTO.StartDate.Value);
        }

        if (queryDTO.EndDate.HasValue)
        {
            query = query.Where(t => t.Date <= queryDTO.EndDate.Value);
        }

        if (queryDTO.PersonId.HasValue)
        {
            query = query.Where(t => t.PersonId == queryDTO.PersonId.Value);
        }

        if (queryDTO.CostTypeIds != null && queryDTO.CostTypeIds.Count > 0)
        {
            query = query.Where(t => t.CostTypes.Any(c => queryDTO.CostTypeIds.Contains(c.CostTypeId)));
        }

        if (queryDTO.NonCostType)
        {
            query = query.Where(t => t.CostTypes.Count == 0);
        }

        if (queryDTO.TransactionType.HasValue)
        {
            query = query.Where(t => t.TransactionType == queryDTO.TransactionType.Value);
        }

        if (queryDTO.MinAmount.HasValue)
        {
            query = query.Where(t => t.Amount >= queryDTO.MinAmount.Value);
        }

        if (queryDTO.MaxAmount.HasValue)
        {
            query = query.Where(t => t.Amount <= queryDTO.MaxAmount.Value);
        }

        if (queryDTO.SortBy == "date")
        {
            query = queryDTO.SortOrder == "asc" ? query.OrderBy(t => t.Date) : query.OrderByDescending(t => t.Date);
        }
        else if (queryDTO.SortBy == "amount")
        {
            query = queryDTO.SortOrder == "asc" ? query.OrderBy(t => t.Amount) : query.OrderByDescending(t => t.Amount);
        }
        else if (queryDTO.SortBy == "name")
        {
            query = queryDTO.SortOrder == "asc" ? query.OrderBy(t => t.Name) : query.OrderByDescending(t => t.Name);
        }


        var transactions = await query.ToListAsync();
        return _mapper.Map<List<TransactionDTO>>(transactions);
    }

    public async Task<TransactionDTO> UpdateTransactionAsync(int id, CreateTransactionDTO updateTransactionDTO)
    {
        var transaction = await _transactionRepository.GetById(id).Include(x => x.CostTypes).FirstOrDefaultAsync();
        if (transaction == null)
        {
            throw AppErrors.TransactionNotFound;
        }

        // Validate amount
        if (updateTransactionDTO.Amount <= 0)
        {
            throw AppErrors.InvalidTransactionAmount;
        }

        // Validate cost type existence
        if (updateTransactionDTO.CostTypes != null && updateTransactionDTO.CostTypes.Count > 0)
        {
            foreach (var costTypeId in updateTransactionDTO.CostTypes)
            {
                var costType = await _costTypeRepository.GetById(costTypeId).FirstOrDefaultAsync() ?? throw AppErrors.CostTypeNotFound;
            }
        }

        // Validate person existence if provided
        if (updateTransactionDTO.PersonId.HasValue)
        {
            var person = await _personRepository.GetById(updateTransactionDTO.PersonId.Value).FirstOrDefaultAsync();
            if (person == null)
            {
                throw AppErrors.PersonNotFound;
            }
        }

        var list = transaction.CostTypes.ToList();
        foreach (var oldCostType in list)
        {
            if (!updateTransactionDTO.CostTypes.Any(x => x == oldCostType.CostTypeId))
            {
                transaction.CostTypes.Remove(oldCostType);
            }
        }

        foreach (var newCostType in updateTransactionDTO.CostTypes)
        {
            if (!transaction.CostTypes.Any(x => x.CostTypeId == newCostType))
            {
                transaction.CostTypes.Add(new TransactionCostTypeModel
                {
                    TransactionId = transaction.Id,
                    CostTypeId = newCostType
                });
            }
        }

        transaction.InjectFrom(updateTransactionDTO);

        transaction.UpdateDate = DateTime.UtcNow;
        _transactionRepository.Edit(transaction);

        return await GetTransactionByIdAsync(id);
    }

    public async Task DeleteTransactionAsync(int id)
    {
        var transaction = await _transactionRepository.GetById(id).FirstOrDefaultAsync();
        if (transaction == null)
        {
            throw AppErrors.TransactionNotFound;
        }

        _transactionRepository.Remove(transaction);
    }

    public async Task<List<string>> GetTransactionNamesAutoComplete(string query)
    {
        var transactions = await _transactionRepository.GetAll()
            .Where(t => t.Name.Contains(query))
            .Distinct()
            .OrderBy(t => t.Name)
            .Select(t => t.Name)
            .ToListAsync();

        return transactions;
    }

    public async Task<List<TransactionDTO>> GetLastTransactionsAsync(TransactionType? transactionType, int count)
    {
        var transactions = await _transactionRepository.GetAll()
            .Where(t => t.TransactionType == transactionType)
            .Include(t => t.CostTypes)
            .ThenInclude(x => x.CostType)
            .OrderByDescending(t => t.SubmitDate)
            .Take(count)
            .ToListAsync();

        return _mapper.Map<List<TransactionDTO>>(transactions);
    }

    public async Task FixTransactionDateTime()
    {
        // This method is no longer needed since we're using DateOnly which doesn't store time information
        // Previously used for migrating DateTime values to remove time components
        await Task.CompletedTask;
    }
}