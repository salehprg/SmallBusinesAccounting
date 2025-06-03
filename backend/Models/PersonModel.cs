using New_Back.Domain;

namespace backend.Models;

public class PersonModel : BaseEntity
{
    public string PersonName {get;set;}
    public string ContactNumber {get;set;}
    public string AccountNumber {get;set;}
    public string AccountBankName {get;set;}
    public string PersonType {get;set;}
    public string Description {get;set;}
}