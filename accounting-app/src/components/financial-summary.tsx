"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialCardProps {
  title: string;
  amount: number;
  className?: string;
}

export function FinancialCard({ title, amount, className }: FinancialCardProps) {
  // Format number with commas
  const formattedAmount = new Intl.NumberFormat('fa-IR').format(amount);

  return (
    <Card className={className}>
      <CardHeader className="py-4">
        <CardTitle className="text-end text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-end">{formattedAmount}</p>
      </CardContent>
    </Card>
  );
}

export function FinancialSummary({ data }: { data: { totalDebts: number; totalCredits: number; financialBalance: number } }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FinancialCard 
        title="کل بدهی‌ها" 
        amount={data.totalDebts} 
      />
      <FinancialCard 
        title="کل اعتبارات" 
        amount={data.totalCredits} 
      />
      <FinancialCard 
        title="تراز مالی" 
        amount={data.financialBalance} 
      />
    </div>
  );
} 