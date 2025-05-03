using AutoMapper;

namespace New_Back.Models;

public class UserModelDTO
{
    public int Id { get; set; }
    public string UserName { get; set; }
    public string PhoneNumber { get; set; }
    public bool Verified { get; set; }
    public DateTime SignUpDate { get; set; }
    public int? GroupId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }


    private class Mapper : Profile
    {
        public Mapper()
        {
            CreateMap<UserModel, UserModelDTO>();
        }
    }
} 