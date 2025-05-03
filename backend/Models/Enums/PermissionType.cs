namespace New_Back.Models.Enums;

public enum PermissionType
{
    // Transaction permissions
    ViewTransactions = 1,
    CreateTransaction = 2,
    EditTransaction = 3,
    DeleteTransaction = 4,
    
    // Person permissions
    ViewPersons = 11,
    CreatePerson = 12,
    EditPerson = 13, 
    DeletePerson = 14,
    
    // Cost Type permissions
    ViewCostTypes = 21,
    CreateCostType = 22,
    EditCostType = 23,
    DeleteCostType = 24,
    
    // User management permissions
    ViewUsers = 31,
    CreateUser = 32,
    EditUser = 33,
    DeleteUser = 34,
    
    // Role management permissions
    ViewRoles = 41,
    CreateRole = 42,
    EditRole = 43,
    DeleteRole = 44,
    
    // Admin permissions
    ManagePermissions = 51,
    SystemSettings = 52
} 