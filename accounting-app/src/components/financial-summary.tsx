"use client";

import React, { useState, useEffect } from 'react';
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
  const [dateRangeError, setDateRangeError] = useState<string>('');

  // Function to convert Persian date string to Date object (assuming format is YYYY/MM/DD)
  const convertPersianDateToJSDate = (persianDate: string): Date | null => {
    if (!persianDate) return null;
    try {
      const [year, month, day] = persianDate.split('/').map(Number);
      return new Date(year, month - 1, day);
    } catch {
      return null;
    }
  };

  // Function to calculate days difference
  const calculateDaysDifference = (start: string, end: string): number => {
    const startDateObj = convertPersianDateToJSDate(start);
    const endDateObj = convertPersianDateToJSDate(end);
    
    if (!startDateObj || !endDateObj) return 0;
    
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Validate date range
  const validateDateRange = (start: string, end: string): boolean => {
    if (!start || !end) {
      setDateRangeError('');
      return true;
    }

    const startDateObj = convertPersianDateToJSDate(start);
    const endDateObj = convertPersianDateToJSDate(end);

    if (!startDateObj || !endDateObj) {
      setDateRangeError('تاریخ‌های وارد شده نامعتبر هستند');
      return false;
    }

    if (endDateObj < startDateObj) {
      setDateRangeError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
      return false;
    }

    const daysDiff = calculateDaysDifference(start, end);
    if (daysDiff > 45) {
      setDateRangeError('بازه زمانی نمی‌تواند بیش از ۴۵ روز باشد');
      return false;
    }

    setDateRangeError('');
    return true;
  };

  // Validate whenever dates change
  useEffect(() => {
    validateDateRange(startDate, endDate);
  }, [startDate, endDate]);

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
  };

  const handleDateFilterApply = () => {
    if (validateDateRange(startDate, endDate)) {
      applyFilter(startDate, endDate);
    }
  };

  const isApplyDisabled = !startDate || !endDate || dateRangeError !== '';

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
                onChange={handleStartDateChange}
                placeholder="انتخاب تاریخ شروع"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-end">تا تاریخ</label>
              <PersianDatePicker
                value={endDate}
                onChange={handleEndDateChange}
                placeholder="انتخاب تاریخ پایان"
              />
            </div>

            {/* Error message display */}
            {dateRangeError && (
              <div className="space-y-2">
                <p className="text-sm text-red-500 text-end">{dateRangeError}</p>
              </div>
            )}

            <div className="flex gap-2 space-y-2">
              <Button
                onClick={handleDateFilterApply}
                className="flex-1"
                disabled={isApplyDisabled}
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