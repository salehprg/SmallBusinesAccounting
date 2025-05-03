using AutoMapper;
using backend.Models;
using backend.Models.DTO;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;
using New_Back.Exceptions;

namespace backend.Services;

public class PersonService : IPersonService
{
    private readonly IRepository<PersonModel> _personRepository;
    private readonly IRepository<TransactionModel> _transactionRepository;
    private readonly IMapper _mapper;

    public PersonService(
        IRepository<PersonModel> personRepository,
        IRepository<TransactionModel> transactionRepository,
        IMapper mapper)
    {
        _personRepository = personRepository;
        _transactionRepository = transactionRepository;
        _mapper = mapper;
    }

    public async Task<PersonDTO> CreatePersonAsync(CreatePersonDTO createPersonDTO)
    {
        var person = _mapper.Map<PersonModel>(createPersonDTO);
        _personRepository.Add(person);

        return _mapper.Map<PersonDTO>(person);
    }

    public async Task<PersonDTO> GetPersonByIdAsync(int id)
    {
        var person = await _personRepository.GetById(id).FirstOrDefaultAsync();
        if (person == null)
        {
            throw AppErrors.PersonNotFound;
        }

        return _mapper.Map<PersonDTO>(person);
    }

    public async Task<List<PersonDTO>> GetAllPersonsAsync()
    {
        var persons = await _personRepository.GetAll().ToListAsync();
        return _mapper.Map<List<PersonDTO>>(persons);
    }

    public async Task<PersonBalanceDTO> GetPersonBalanceAsync(int id)
    {
        var person = await _personRepository.GetById(id).FirstOrDefaultAsync();
        if (person == null)
        {
            throw AppErrors.PersonNotFound;
        }

        var transactions = await _transactionRepository.GetAll()
            .Include(t => t.CostType)
            .Where(t => t.PersonId == id)
            .ToListAsync();

        var balance = CalculateBalance(transactions);

        var personBalanceDTO = new PersonBalanceDTO
        {
            Id = person.Id,
            PersonName = person.PersonName,
            Balance = balance,
            Transactions = _mapper.Map<List<TransactionDTO>>(transactions)
        };

        return personBalanceDTO;
    }

    public async Task<PersonBalanceDTO> GetPersonTransactionsAsync(int id, DateTime? startDate, DateTime? endDate)
    {
        var person = await _personRepository.GetById(id).FirstOrDefaultAsync();
        if (person == null)
        {
            throw AppErrors.PersonNotFound;
        }

        if (startDate.HasValue && endDate.HasValue && startDate > endDate)
        {
            throw AppErrors.InvalidDateRange;
        }

        var query = _transactionRepository.GetAll()
            .Include(t => t.CostType)
            .Where(t => t.PersonId == id);

        if (startDate.HasValue)
        {
            query = query.Where(t => t.Date >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(t => t.Date <= endDate.Value);
        }

        var transactions = await query.ToListAsync();
        var balance = CalculateBalance(transactions);

        var personBalanceDTO = new PersonBalanceDTO
        {
            Id = person.Id,
            PersonName = person.PersonName,
            Balance = balance,
            Transactions = _mapper.Map<List<TransactionDTO>>(transactions)
        };

        return personBalanceDTO;
    }

    public async Task<PersonDTO> UpdatePersonAsync(int id, CreatePersonDTO updatePersonDTO)
    {
        var person = await _personRepository.GetById(id).FirstOrDefaultAsync();
        if (person == null)
        {
            throw AppErrors.PersonNotFound;
        }

        _mapper.Map(updatePersonDTO, person);
        _personRepository.Edit(person);

        return _mapper.Map<PersonDTO>(person);
    }

    public async Task DeletePersonAsync(int id)
    {
        var person = await _personRepository.GetById(id).FirstOrDefaultAsync();
        if (person == null)
        {
            throw AppErrors.PersonNotFound;
        }

        // Check if there are transactions associated with this person
        var hasTransactions = await _transactionRepository.GetAll()
            .AnyAsync(t => t.PersonId == id);

        if (hasTransactions)
        {
            throw AppErrors.PersonHasTransactions;
        }

        _personRepository.Remove(person);
    }

    private decimal CalculateBalance(List<TransactionModel> transactions)
    {
        decimal balance = 0;
        
        foreach (var transaction in transactions)
        {
            if (transaction.TransactionType == TransactionType.Income)
            {
                balance += transaction.Amount;
            }
            else
            {
                balance -= transaction.Amount;
            }
        }
        
        return balance;
    }
} 