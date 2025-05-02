export interface FinancialData {
  totalDebts: number;
  totalCredits: number;
  financialBalance: number;
}

export interface DailyIncomeData {
  day: string;
  amount: number;
}

export interface ExpensesData {
  category: string;
  amount: number;
  label: string;
} 