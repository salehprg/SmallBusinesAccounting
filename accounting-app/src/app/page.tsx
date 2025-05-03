"use client";

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { FinancialSummary } from '@/components/financial-summary';
import { DailyIncomeChart } from '@/components/daily-income-chart';
import { ExpensesChart } from '@/components/expenses-chart';
import { TransactionsAPI, TransactionDTO, TransactionType } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function Dashboard() {
  // Ensure user is authenticated
  const isAuthenticated = useRequireAuth();
  
  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }
  
  return <DashboardContent />;
}

function DashboardContent() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [financialData, setFinancialData] = useState({
    totalDebts: 0,
    totalCredits: 0,
    financialBalance: 0
  });
  
  const [dailyIncomeData, setDailyIncomeData] = useState<{ day: string; amount: number }[]>([]);
  const [expensesData, setExpensesData] = useState<{ category: string; amount: number; label: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch transactions
        const data = await TransactionsAPI.getAll();
        setTransactions(data);
        
        // Calculate financial summary
        let totalDebts = 0;
        let totalCredits = 0;
        
        data.forEach(transaction => {
          if (transaction.transactionType === TransactionType.Expense) {
            totalDebts += transaction.amount;
          } else {
            totalCredits += transaction.amount;
          }
        });
        
        setFinancialData({
          totalDebts,
          totalCredits,
          financialBalance: totalCredits - totalDebts
        });
        
        // Process daily income data (last 7 days)
        const now = new Date();
        const dailyIncome: { [key: string]: number } = {};
        
        // Initialize with the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const day = date.getDate().toString();
          dailyIncome[day] = 0;
        }
        
        // Sum up income for each day
        data.forEach(transaction => {
          if (transaction.transactionType === TransactionType.Income) {
            const transactionDate = new Date(transaction.date);
            const day = transactionDate.getDate().toString();
            
            // Only include recent transactions (last 7 days)
            const diff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diff <= 6) {
              dailyIncome[day] = (dailyIncome[day] || 0) + transaction.amount;
            }
          }
        });
        
        // Convert to array format
        const dailyIncomeArray = Object.entries(dailyIncome).map(([day, amount]) => ({
          day,
          amount
        }));
        
        setDailyIncomeData(dailyIncomeArray);
        
        // Process expenses by category
        const expensesByCategory: { [key: string]: number } = {};
        const categoryLabels: { [key: string]: string } = {};
        
        data.forEach(transaction => {
          if (transaction.transactionType === TransactionType.Expense) {
            const category = transaction.costTypeName;
            expensesByCategory[category] = (expensesByCategory[category] || 0) + transaction.amount;
            categoryLabels[category] = category; // Use cost type name as label
          }
        });
        
        // Convert to array format
        const expensesArray = Object.entries(expensesByCategory).map(([category, amount]) => ({
          category,
          amount,
          label: categoryLabels[category]
        }));
        
        setExpensesData(expensesArray);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('خطا در دریافت اطلاعات');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-end">داشبورد</h1>
        <p className="text-muted-foreground text-end">
          {user && `${user.firstName} ${user.lastName}`}
        </p>
      </div>

      <FinancialSummary data={financialData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DailyIncomeChart data={dailyIncomeData} />
        <ExpensesChart data={expensesData} />
      </div>
    </div>
  );
}
