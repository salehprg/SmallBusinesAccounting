using New_Back.Exceptions;

public static class AppErrors
{
    // Transaction errors
    public static AppException TransactionNotFound = new(4001, "Transaction not found", "تراکنش مورد نظر یافت نشد");
    
    public static AppException InvalidTransactionAmount = new(4002, "Transaction amount is invalid", "مبلغ تراکنش نامعتبر است");
    
    // Person errors
    public static AppException PersonNotFound = new(4101, "Person not found", "شخص مورد نظر یافت نشد");
    
    public static AppException PersonHasTransactions = new(4102, "Cannot delete person with associated transactions", "این شخص دارای تراکنش است و نمی‌توان آن را حذف کرد");
    
    // CostType errors
    public static AppException CostTypeNotFound = new(4201, "Cost type not found", "نوع هزینه یافت نشد");
    
    public static AppException CostTypeHasTransactions = new(4202, "Cannot delete cost type with associated transactions", "این نوع هزینه دارای تراکنش است و نمی‌توان آن را حذف کرد");
    
    // Date range errors
    public static AppException InvalidDateRange = new(4301, "Invalid date range", "بازه زمانی نامعتبر است");
        
    // Authentication errors
    public static AppException InvalidCredentials = new(4401, "Invalid username or password", "نام کاربری یا رمز عبور نامعتبر است");
    
    public static AppException UsernameTaken = new(4402, "Username is already taken", "این نام کاربری قبلاً استفاده شده است");
    
    public static AppException EmailTaken = new(4403, "Email is already in use", "این ایمیل قبلاً استفاده شده است");
    
    public static AppException UserBanned = new(4404, "User account is banned", "حساب کاربری شما مسدود شده است");
    
    public static AppException UserInactive = new(4405, "User account is inactive", "حساب کاربری شما غیرفعال است");
    
    public static AppException InvalidCurrentPassword = new(4406, "Current password is incorrect", "رمز عبور فعلی اشتباه است");
    
    public static AppException PasswordMismatch = new(4407, "New password and confirmation do not match", "رمز عبور جدید و تأیید آن مطابقت ندارند");
        
    // Authorization errors
    public static AppException Unauthorized = new(4501, "User is not authorized to perform this action", "شما مجاز به انجام این عمل نیستید");
    
    public static AppException TokenExpired = new(4502, "Authentication token has expired", "توکن احراز هویت منقضی شده است");
    
    // User management errors
    public static AppException UserNotFound = new(4601, "User not found", "کاربر مورد نظر یافت نشد");
    
    // Role management errors
    public static AppException RoleNotFound = new(4701, "Role not found", "نقش مورد نظر یافت نشد");
    
    public static AppException RoleNameTaken = new(4702, "Role name is already taken", "این نام نقش قبلاً استفاده شده است");
    
    public static AppException RoleInUse = new(4703, "Cannot delete role that is assigned to users", "این نقش به کاربران اختصاص یافته است و نمی‌توان آن را حذف کرد");
    
    // Permission management errors
    public static AppException PermissionNotFound = new(4801, "Permission not found", "مجوز مورد نظر یافت نشد");
    
    public static AppException PermissionInUse = new(4802, "Cannot delete permission that is assigned to roles", "این مجوز به نقش‌ها اختصاص یافته است و نمی‌توان آن را حذف کرد");
}