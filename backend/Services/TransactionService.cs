using AutoMapper;
using backend.Models;
using backend.Models.DTO;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;
using New_Back.Exceptions;

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
        var costType = await _costTypeRepository.GetById(createTransactionDTO.CostTypeId).FirstOrDefaultAsync();
        if (costType == null)
        {
            throw AppErrors.CostTypeNotFound;
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

        var transaction = _mapper.Map<TransactionModel>(createTransactionDTO);
        _transactionRepository.Add(transaction);

        return await GetTransactionByIdAsync(transaction.Id);
    }

    public async Task<TransactionDTO> GetTransactionByIdAsync(int id)
    {
        var transaction = await _transactionRepository.GetAll()
            .Include(t => t.CostType)
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
            .Include(t => t.CostType)
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
            .Include(t => t.CostType)
            .Include(t => t.Person)
            .AsQueryable();

        // Apply filters
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

        if (queryDTO.CostTypeId.HasValue)
        {
            query = query.Where(t => t.CostTypeId == queryDTO.CostTypeId.Value);
        }

        if (queryDTO.TransactionType.HasValue)
        {
            query = query.Where(t => t.TransactionType == queryDTO.TransactionType.Value);
        }

        var transactions = await query.ToListAsync();
        return _mapper.Map<List<TransactionDTO>>(transactions);
    }

    public async Task<TransactionDTO> UpdateTransactionAsync(int id, CreateTransactionDTO updateTransactionDTO)
    {
        var transaction = await _transactionRepository.GetById(id).FirstOrDefaultAsync();
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
        var costType = await _costTypeRepository.GetById(updateTransactionDTO.CostTypeId).FirstOrDefaultAsync();
        if (costType == null)
        {
            throw AppErrors.CostTypeNotFound;
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

        _mapper.Map(updateTransactionDTO, transaction);
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
} 