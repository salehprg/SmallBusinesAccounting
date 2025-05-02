"use client";

import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { FinancialSummary } from '@/components/financial-summary';
import { DailyIncomeChart } from '@/components/daily-income-chart';
import { ExpensesChart } from '@/components/expenses-chart';
import { financialData, dailyIncomeData, expensesData } from '@/lib/mock-data';

export default function Dashboard() {
  return (
    <DashboardContent />
  );
}

function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-end">داشبورد</h1>
        <p className="text-muted-foreground text-end">شهریور ۱۴۰۱</p>
      </div>

      <FinancialSummary data={financialData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DailyIncomeChart data={dailyIncomeData} />
        <ExpensesChart data={expensesData} />
      </div>
    </div>
  );
}
