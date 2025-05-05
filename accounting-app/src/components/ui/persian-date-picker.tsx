"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from "lucide-react";
import { cn } from '@/lib/utils';
import { DatePicker } from 'noa-jalali-datepicker';
import 'noa-jalali-datepicker/dist/index.css';

interface PersianDatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (e: any) => void;
  value: string;
}

const PersianDatePicker = React.forwardRef<HTMLInputElement, PersianDatePickerProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const [jalaaliDate, setJalaaliDate] = useState('');
    
    const [selectedDate, setSelectedDate] = useState<string | null>(value);

    // Handle change and convert Jalaali to Gregorian
    const handleChange = (date: string) => {
      
      setSelectedDate(date);
    };

    return (
      <div className="relative w-full">
        <DatePicker
          value={selectedDate}
          placeholderText="Pick a date"
          onChange={(date) => {
            console.log(date);
            handleChange(date);
          }}
          size="md"
          dayClassName='hover:bg-gray-50'
          
          dir="rtl"
        />
      </div>
    );
  }
);

PersianDatePicker.displayName = "PersianDatePicker";

export { PersianDatePicker }; 