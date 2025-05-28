import { api } from './auth';

// Types based on Swagger definitions
export interface APIResponse<T> {
  success: boolean;
  code: number;
  message: string | null;
  developerMessage: string | null;
  data: T;
}

// CostTypes
export interface CostTypeDTO {
  id: number;
  name: string;
}

export interface CreateCostTypeDTO {
  name: string;
}

export const CostTypesAPI = {
  getAll: async (): Promise<CostTypeDTO[]> => {
    const response = await api.get<APIResponse<CostTypeDTO[]>>('/api/CostTypes');
    return response.data.data;
  },
  
  getById: async (id: number): Promise<CostTypeDTO> => {
    const response = await api.get<APIResponse<CostTypeDTO>>(`/api/CostTypes/${id}`);
    return response.data.data;
  },
  
  create: async (data: CreateCostTypeDTO): Promise<CostTypeDTO> => {
    const response = await api.post<APIResponse<CostTypeDTO>>('/api/CostTypes', data);
    return response.data.data;
  },
  
  update: async (id: number, data: { name: string }): Promise<CostTypeDTO> => {
    const response = await api.put<APIResponse<CostTypeDTO>>(`/api/CostTypes/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/CostTypes/${id}`);
  }
};

// Permissions
export interface PermissionDTO {
  id: number;
  name: string;
  description: string;
}

export const PermissionsAPI = {
  getAll: async (): Promise<PermissionDTO[]> => {
    const response = await api.get<APIResponse<PermissionDTO[]>>('/api/Permissions');
    return response.data.data;
  },
  
  getById: async (id: number): Promise<PermissionDTO> => {
    const response = await api.get<APIResponse<PermissionDTO>>(`/api/Permissions/${id}`);
    return response.data.data;
  },
  
  create: async (data: PermissionDTO): Promise<PermissionDTO> => {
    const response = await api.post<APIResponse<PermissionDTO>>('/api/Permissions', data);
    return response.data.data;
  },
  
  update: async (id: number, data: PermissionDTO): Promise<PermissionDTO> => {
    const response = await api.put<APIResponse<PermissionDTO>>(`/api/Permissions/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number): Promise<boolean> => {
    const response = await api.delete<APIResponse<boolean>>(`/api/Permissions/${id}`);
    return response.data.data;
  }
};

// Persons
export interface PersonDTO {
  id: number;
  personName: string;
  contactNumber: string;
  accountNumber: string;
  personType: string;
  description: string;
}

export interface CreatePersonDTO {
  personName: string;
  contactNumber: string;
  accountNumber: string;
  personType: string;
  description: string;
}

export interface PersonBalanceDTO {
  id: number;
  personName: string;
  balance: number;
  transactions: TransactionDTO[];
}

export const PersonsAPI = {
  getAll: async (): Promise<PersonDTO[]> => {
    const response = await api.get<APIResponse<PersonDTO[]>>('/api/Persons');
    return response.data.data;
  },
  
  getById: async (id: number): Promise<PersonDTO> => {
    const response = await api.get<APIResponse<PersonDTO>>(`/api/Persons/${id}`);
    return response.data.data;
  },
  
  create: async (data: CreatePersonDTO): Promise<PersonDTO> => {
    const response = await api.post<APIResponse<PersonDTO>>('/api/Persons', data);
    return response.data.data;
  },
  
  update: async (id: number, data: CreatePersonDTO): Promise<PersonDTO> => {
    const response = await api.put<APIResponse<PersonDTO>>(`/api/Persons/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/Persons/${id}`);
  },
  
  getBalance: async (id: number): Promise<PersonBalanceDTO> => {
    const response = await api.get<APIResponse<PersonBalanceDTO>>(`/api/Persons/${id}/balance`);
    return response.data.data;
  },
  
  getTransactions: async (id: number, startDate?: Date, endDate?: Date): Promise<PersonBalanceDTO> => {
    let url = `/api/Persons/${id}/transactions`;
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get<APIResponse<PersonBalanceDTO>>(url);
    return response.data.data;
  }
};

// Roles
export interface RoleDTO {
  id: number;
  name: string;
  description: string;
  permissions: PermissionDTO[];
}

export interface CreateRoleDTO {
  name: string;
  description: string;
  permissionIds: number[];
}

export interface UpdateRoleDTO {
  name: string;
  description: string;
  permissionIds: number[];
}

export interface UpdateRolePermissionsDTO {
  roleId: number;
  permissionIds: number[];
}

export const RolesAPI = {
  getAll: async (): Promise<RoleDTO[]> => {
    const response = await api.get<APIResponse<RoleDTO[]>>('/api/Roles');
    return response.data.data;
  },
  
  getById: async (id: number): Promise<RoleDTO> => {
    const response = await api.get<APIResponse<RoleDTO>>(`/api/Roles/${id}`);
    return response.data.data;
  },
  
  create: async (data: CreateRoleDTO): Promise<RoleDTO> => {
    const response = await api.post<APIResponse<RoleDTO>>('/api/Roles', data);
    return response.data.data;
  },
  
  update: async (id: number, data: UpdateRoleDTO): Promise<RoleDTO> => {
    const response = await api.put<APIResponse<RoleDTO>>(`/api/Roles/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number): Promise<boolean> => {
    const response = await api.delete<APIResponse<boolean>>(`/api/Roles/${id}`);
    return response.data.data;
  },
  
  updatePermissions: async (data: UpdateRolePermissionsDTO): Promise<RoleDTO> => {
    const response = await api.put<APIResponse<RoleDTO>>('/api/Roles/permissions', data);
    return response.data.data;
  }
};

// Transactions
export enum TransactionType {
  Income = 1,
  Expense = 2
}

export interface TransactionDTO {
  id: number;
  name: string;
  description: string;
  amount: number;
  date: string;
  isCash: boolean;
  costTypeId: number;
  costTypeName: string;
  transactionType: TransactionType;
  personId?: number;
  personName?: string;
}

export interface CreateTransactionDTO {
  name: string;
  description: string;
  amount: number;
  date: string;
  isCash: boolean;
  costTypeId?: number;
  transactionType: TransactionType;
  personId?: number;
}

export interface TransactionQueryDTO {
  startDate?: string;
  endDate?: string;
  personId?: number;
  costTypeId?: number;
  transactionType?: TransactionType;
  sortBy?: string;
  sortOrder?: string;
}

export const TransactionsAPI = {
  getAll: async (): Promise<TransactionDTO[]> => {
    const response = await api.get<APIResponse<TransactionDTO[]>>('/api/Transactions');
    return response.data.data;
  },

  getLastTransactions: async (transactionType: TransactionType, count : number): Promise<TransactionDTO[]> => {
    const response = await api.get<APIResponse<TransactionDTO[]>>(`/api/Transactions/last/${count}?transactionType=${transactionType}`);
    return response.data.data;
  },

  getAutoComplete: async (query: string): Promise<string[]> => {
    const response = await api.get<APIResponse<string[]>>(`/api/Transactions/autocomplete?query=${encodeURIComponent(query)}`);
    return response.data.data;
  },
  
  getById: async (id: number): Promise<TransactionDTO> => {
    const response = await api.get<APIResponse<TransactionDTO>>(`/api/Transactions/${id}`);
    return response.data.data;
  },
  
  create: async (data: CreateTransactionDTO): Promise<TransactionDTO> => {
    const response = await api.post<APIResponse<TransactionDTO>>('/api/Transactions', data);
    return response.data.data;
  },
  
  update: async (id: number, data: CreateTransactionDTO): Promise<TransactionDTO> => {
    const response = await api.put<APIResponse<TransactionDTO>>(`/api/Transactions/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/Transactions/${id}`);
  },
  
  query: async (queryParams: TransactionQueryDTO): Promise<TransactionDTO[]> => {
    const response = await api.post<APIResponse<TransactionDTO[]>>('/api/Transactions/query', queryParams);
    return response.data.data;
  }
};

// Users
export interface UserDTO {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin?: string;
  roles: string[];
}

export interface CreateUserDTO {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: number[];
}

export interface UpdateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isBanned: boolean;
  roleIds: number[];
}

export interface UpdateUserRolesDTO {
  userId: number;
  roleIds: number[];
}

export const UsersAPI = {
  getAll: async (): Promise<UserDTO[]> => {
    const response = await api.get<APIResponse<UserDTO[]>>('/api/Users');
    return response.data.data;
  },
  
  getById: async (id: number): Promise<UserDTO> => {
    const response = await api.get<APIResponse<UserDTO>>(`/api/Users/${id}`);
    return response.data.data;
  },
  
  create: async (data: CreateUserDTO): Promise<UserDTO> => {
    const response = await api.post<APIResponse<UserDTO>>('/api/Users', data);
    return response.data.data;
  },
  
  update: async (id: number, data: UpdateUserDTO): Promise<UserDTO> => {
    const response = await api.put<APIResponse<UserDTO>>(`/api/Users/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number): Promise<boolean> => {
    const response = await api.delete<APIResponse<boolean>>(`/api/Users/${id}`);
    return response.data.data;
  },
  
  updateRoles: async (data: UpdateUserRolesDTO): Promise<UserDTO> => {
    const response = await api.put<APIResponse<UserDTO>>('/api/Users/roles', data);
    return response.data.data;
  },
  
  getCurrentUser: async (): Promise<UserDTO> => {
    const response = await api.get<APIResponse<UserDTO>>('/api/Users/me');
    return response.data.data;
  },
  
  getCurrentUserPermissions: async (): Promise<string[]> => {
    const response = await api.get<APIResponse<string[]>>('/api/Users/me/permissions');
    return response.data.data;
  }
};

// Reports
export interface FinancialSummaryDTO {
  totalDebts: number;
  totalCredits: number;
  financialBalance: number;
}

export interface DailyIncomeDTO {
  day: string;
  amount: number;
}

export interface ExpensesByCategoryDTO {
  category: string;
  amount: number;
  label: string;
}

export interface ReportSummaryDTO {
  financialSummary: FinancialSummaryDTO;
  dailyIncomeData: DailyIncomeDTO[];
  expensesData: ExpensesByCategoryDTO[];
}

export const ReportsAPI = {
  getSummary: async (startDate: Date, endDate: Date,): Promise<ReportSummaryDTO> => {
    let url = '/api/Report/summary';
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('StartDate', startDate.toISOString());
    }
    
    if (endDate) {
      params.append('EndDate', endDate.toISOString());
    }
    
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get<APIResponse<ReportSummaryDTO>>(url);
    return response.data.data;
  },
  
  getFinancialSummary: async (startDate?: Date, endDate?: Date): Promise<FinancialSummaryDTO> => {
    let url = '/api/Report/financial-summary';
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get<APIResponse<FinancialSummaryDTO>>(url);
    return response.data.data;
  },
  
  getDailyIncome: async (days: number = 7): Promise<DailyIncomeDTO[]> => {
    const response = await api.get<APIResponse<DailyIncomeDTO[]>>(`/api/Report/daily-income?days=${days}`);
    return response.data.data;
  },
  
  getExpensesByCategory: async (startDate?: Date, endDate?: Date): Promise<ExpensesByCategoryDTO[]> => {
    let url = '/api/Report/expenses-by-category';
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get<APIResponse<ExpensesByCategoryDTO[]>>(url);
    return response.data.data;
  }
}; 