using AutoMapper;
using backend.Models;
using backend.Models.DTO;
using Microsoft.EntityFrameworkCore;
using New_Back.DataAccess;
using New_Back.Exceptions;

namespace backend.Services;

public class CostTypeService : ICostTypeService
{
    private readonly IRepository<CostType> _costTypeRepository;
    private readonly IRepository<TransactionModel> _transactionRepository;
    private readonly IMapper _mapper;

    public CostTypeService(
        IRepository<CostType> costTypeRepository,
        IRepository<TransactionModel> transactionRepository,
        IMapper mapper)
    {
        _costTypeRepository = costTypeRepository;
        _transactionRepository = transactionRepository;
        _mapper = mapper;
    }

    public async Task<CostTypeDTO> CreateCostTypeAsync(CreateCostTypeDTO createCostTypeDTO)
    {
        var costType = _mapper.Map<CostType>(createCostTypeDTO);
        _costTypeRepository.Add(costType);

        return _mapper.Map<CostTypeDTO>(costType);
    }

    public async Task<CostTypeDTO> GetCostTypeByIdAsync(int id)
    {
        var costType = await _costTypeRepository.GetById(id).FirstOrDefaultAsync();
        if (costType == null)
        {
            throw AppErrors.CostTypeNotFound;
        }

        return _mapper.Map<CostTypeDTO>(costType);
    }

    public async Task<List<CostTypeDTO>> GetAllCostTypesAsync()
    {
        var costTypes = await _costTypeRepository.GetAll().ToListAsync();
        return _mapper.Map<List<CostTypeDTO>>(costTypes);
    }

    public async Task<CostTypeDTO> UpdateCostTypeAsync(int id, CreateCostTypeDTO updateCostTypeDTO)
    {
        var costType = await _costTypeRepository.GetById(id).FirstOrDefaultAsync();
        if (costType == null)
        {
            throw AppErrors.CostTypeNotFound;
        }

        _mapper.Map(updateCostTypeDTO, costType);
        _costTypeRepository.Edit(costType);

        return _mapper.Map<CostTypeDTO>(costType);
    }

    public async Task DeleteCostTypeAsync(int id)
    {
        var costType = await _costTypeRepository.GetById(id).FirstOrDefaultAsync();
        if (costType == null)
        {
            throw AppErrors.CostTypeNotFound;
        }

        // Check if there are transactions associated with this cost type
        var hasTransactions = await _transactionRepository.GetAll()
            .AnyAsync(t => t.CostTypeId == id);

        if (hasTransactions)
        {
            throw AppErrors.CostTypeHasTransactions;
        }

        _costTypeRepository.Remove(costType);
    }
} 