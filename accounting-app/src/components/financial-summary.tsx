"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersianDatePicker } from './ui/persian-date-picker';
import { Button } from './ui/button';

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

export function FinancialSummary({ data, applyFilter, _startDate, _endDate }: { data: { totalDebts: number; totalCredits: number; financialBalance: number }
                                                          , applyFilter: (startDate: string, endDate: string) => void
                                                        , _startDate: string, _endDate: string }) {

  // Date filter states
  const [startDate, setStartDate] = useState<string>(_startDate);
  const [endDate, setEndDate] = useState<string>(_endDate);

  const handleDateFilterApply = () => {
    applyFilter(startDate, endDate);
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6">

      <FinancialCard
        title="کل بدهی‌ها"
        amount={data.totalDebts}
        className="md:col-span-2"
      />
      <FinancialCard
        title="کل اعتبارات"
        amount={data.totalCredits}
        className="md:col-span-2"
      />
      <FinancialCard
        title="تراز مالی"
        amount={data.financialBalance}
        className="md:col-span-2"
      />
      {/* Date Filter Section */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-end">فیلتر تاریخ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gap-4 items-end">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-end">از تاریخ</label>
              <PersianDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="انتخاب تاریخ شروع"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-end">تا تاریخ</label>
              <PersianDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="انتخاب تاریخ پایان"
              />
            </div>

            <div className="flex gap-2 space-y-2  ">
              <Button
                onClick={handleDateFilterApply}
                className="flex-1"
              >
                اعمال فیلتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
} 