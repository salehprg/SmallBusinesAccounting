using backend.Models;
using backend.Models.DTO;

namespace backend.Services;

public interface IPersonService
{
    Task<PersonDTO> CreatePersonAsync(CreatePersonDTO createPersonDTO);
    Task<PersonDTO> GetPersonByIdAsync(int id);
    Task<List<PersonDTO>> GetAllPersonsAsync();
    Task<PersonBalanceDTO> GetPersonBalanceAsync(int id);
    Task<PersonBalanceDTO> GetPersonTransactionsAsync(int id, DateOnly? startDate, DateOnly? endDate);
    Task<PersonDTO> UpdatePersonAsync(int id, CreatePersonDTO updatePersonDTO);
    Task DeletePersonAsync(int id);
} 