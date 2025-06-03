using backend.Models.DTO;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using New_Back.Controllers;
using New_Back.Models.API;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PersonsController : MyBaseController
{
    private readonly IPersonService _personService;

    public PersonsController(IPersonService personService)
    {
        _personService = personService;
    }   

    [HttpGet]
    [Authorize(Policy = "Permission:ViewPersons")]
    public async Task<ActionResult<APIResponse<List<PersonDTO>>>> GetAllPersons()
    {
        var persons = await _personService.GetAllPersonsAsync();
        return Ok(persons.OrderBy(x => x.PersonName));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Permission:ViewPersons")]
    public async Task<ActionResult<APIResponse<PersonDTO>>> GetPersonById(int id)
    {
        var person = await _personService.GetPersonByIdAsync(id);
        return Ok(person);
    }

    [HttpGet("{id}/balance")]
    [Authorize(Policy = "Permission:ViewPersons")]
    public async Task<ActionResult<APIResponse<PersonBalanceDTO>>> GetPersonBalance(int id)
    {
        var personBalance = await _personService.GetPersonBalanceAsync(id);
        return Ok(personBalance);
    }

    [HttpGet("{id}/transactions")]
    [Authorize(Policy = "Permission:ViewPersons")]
    public async Task<ActionResult<APIResponse<PersonBalanceDTO>>> GetPersonTransactions(
        int id, 
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        var personTransactions = await _personService.GetPersonTransactionsAsync(id, startDate, endDate);
        return Ok(personTransactions);
    }

    [HttpPost]
    [Authorize(Policy = "Permission:CreatePerson")]
    public async Task<ActionResult<APIResponse<PersonDTO>>> CreatePerson([FromBody] CreatePersonDTO createPersonDTO)
    {
        var person = await _personService.CreatePersonAsync(createPersonDTO);
        var response = APIResponse<PersonDTO>.SuccessResult(person);
        return CreatedAtAction(nameof(GetPersonById), new { id = person.Id }, response);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Permission:EditPerson")]
    public async Task<ActionResult<APIResponse<PersonDTO>>> UpdatePerson(int id, [FromBody] CreatePersonDTO updatePersonDTO)
    {
        var person = await _personService.UpdatePersonAsync(id, updatePersonDTO);
        return Ok(person);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Permission:DeletePerson")]
    public async Task<ActionResult> DeletePerson(int id)
    {
        await _personService.DeletePersonAsync(id);
        return Ok();
    }
}