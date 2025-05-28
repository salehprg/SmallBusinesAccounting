"use client";

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { FinancialSummary } from '@/components/financial-summary';
import { DailyIncomeChart } from '@/components/daily-income-chart';
import { ExpensesChart } from '@/components/expenses-chart';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportsAPI, ReportSummaryDTO, FinancialSummaryDTO, DailyIncomeDTO, ExpensesByCategoryDTO } from '@/lib/api';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  
  const [financialData, setFinancialData] = useState<FinancialSummaryDTO>({
    totalDebts: 0,
    totalCredits: 0,
    financialBalance: 0
  });
  
  const [dailyIncomeData, setDailyIncomeData] = useState<DailyIncomeDTO[]>([]);
  const [expensesData, setExpensesData] = useState<ExpensesByCategoryDTO[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchData = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    try {
      // Calculate 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Fetch summary data from the new API endpoint
      // Pass startDate and endDate if they are set, otherwise use default dates
      const summaryData = await ReportsAPI.getSummary(
        startDate ? new Date(startDate) : sevenDaysAgo, 
        endDate ? new Date(endDate) : new Date(),  
      );
      
      // Set the financial summary data
      setFinancialData(summaryData.financialSummary);
      
      // Set daily income data
      setDailyIncomeData(summaryData.dailyIncomeData || []);
      
      // Set expenses data
      setExpensesData(summaryData.expensesData || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('خطا در دریافت اطلاعات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData('', '');
  }, []);

  const handleDateFilterApply = (startDate: string, endDate: string) => {
    fetchData(startDate, endDate);
  };


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

      <FinancialSummary data={financialData} applyFilter={handleDateFilterApply} _startDate={''} _endDate={''} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DailyIncomeChart data={dailyIncomeData} />
        <ExpensesChart data={expensesData} />
      </div>
    </div>
  );
}
