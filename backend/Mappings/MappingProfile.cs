using AutoMapper;
using backend.Models;
using backend.Models.DTO;
using New_Back.Models;

namespace backend.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Transaction mappings
        CreateMap<TransactionModel, TransactionDTO>()
            .ForMember(dest => dest.PersonName, opt => opt.MapFrom(src => src.Person != null ? src.Person.PersonName : null));
        CreateMap<CreateTransactionDTO, TransactionModel>();

        // Person mappings
        CreateMap<PersonModel, PersonDTO>();
        CreateMap<CreatePersonDTO, PersonModel>();

        // CostType mappings
        CreateMap<CostType, CostTypeDTO>();
        CreateMap<CreateCostTypeDTO, CostType>();

        // TransactionCostType mappings
        CreateMap<TransactionCostTypeModel, TransactionCostTypeDTO>();
        
        // User mappings
        CreateMap<UserModel, UserDTO>();
        CreateMap<CreateUserDTO, UserModel>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.IsBanned, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        
        // Role mappings
        CreateMap<RoleModel, RoleDTO>();
        
        // Permission mappings
        CreateMap<PermissionModel, PermissionDTO>();
        CreateMap<PermissionDTO, PermissionModel>();
    }
} 