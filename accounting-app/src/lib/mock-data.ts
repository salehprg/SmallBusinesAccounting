// Mock financial data
export const financialData = {
  totalDebts: 3500000,
  totalCredits: 12000000,
  financialBalance: 8500000,
};

// Mock daily income data for chart
export const dailyIncomeData = [
  { day: '1', amount: 120000 },
  { day: '2', amount: 185000 },
  { day: '3', amount: 95000 },
  { day: '4', amount: 140000 },
  { day: '5', amount: 70000 },
  { day: '6', amount: 190000 },
  { day: '7', amount: 150000 },
];

// Mock categorized expenses data
export const expensesData = [
  { category: 'rent', amount: 1500000, label: 'اجاره' },
  { category: 'salary', amount: 2000000, label: 'حقوق' },
  { category: 'utilities', amount: 800000, label: 'قبوض' },
  { category: 'supplies', amount: 600000, label: 'لوازم' },
  { category: 'insurance', amount: 500000, label: 'بیمه' },
];

// Mock transactions data
export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  category?: string;
}

export const transactionsData: Transaction[] = [
  { id: 1, type: 'income', description: 'دریافت از مشتری', amount: 25000000, date: '1402/04/05', category: 'sales' },
  { id: 2, type: 'expense', description: 'خرید مواد اولیه', amount: 10000000, date: '1402/04/03', category: 'supplies' },
  { id: 3, type: 'expense', description: 'پرداخت اجاره', amount: 5000000, date: '1402/04/01', category: 'rent' },
  { id: 4, type: 'income', description: 'فروش محصول', amount: 15000000, date: '1402/03/28', category: 'sales' },
  { id: 5, type: 'expense', description: 'پرداخت حقوق', amount: 8000000, date: '1402/03/25', category: 'salary' },
  { id: 6, type: 'expense', description: 'هزینه تبلیغات', amount: 3000000, date: '1402/03/20', category: 'marketing' },
  { id: 7, type: 'income', description: 'فروش خدمات', amount: 12000000, date: '1402/03/15', category: 'services' },
  { id: 8, type: 'expense', description: 'پرداخت قبوض', amount: 1500000, date: '1402/03/10', category: 'utilities' },
  { id: 9, type: 'income', description: 'دریافت از مشتری قدیمی', amount: 7000000, date: '1402/03/05', category: 'sales' },
  { id: 10, type: 'expense', description: 'هزینه حمل و نقل', amount: 2000000, date: '1402/03/01', category: 'transportation' },
  { id: 11, type: 'income', description: 'درآمد مشاوره', amount: 5000000, date: '1402/02/25', category: 'consulting' },
  { id: 12, type: 'expense', description: 'خرید تجهیزات', amount: 15000000, date: '1402/02/20', category: 'equipment' },
]; 