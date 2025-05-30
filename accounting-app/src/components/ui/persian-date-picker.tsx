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

    // Add iOS-specific styles
    useEffect(() => {
      // Only add styles once
      if (!document.getElementById('ios-datepicker-styles')) {
        const style = document.createElement('style');
        style.id = 'ios-datepicker-styles';
        style.textContent = `
          .ios-date-picker input {
            background-color: #ffffff !important;
            -webkit-appearance: none !important;
            appearance: none !important;
            background: #ffffff !important;
            opacity: 1 !important;
          }
          
          .ios-date-picker .noa-datepicker-popup {
            background-color: #ffffff !important;
            background: #ffffff !important;
            border: 1px solid #d1d5db !important;
          }
          
          .ios-date-picker .noa-datepicker-day {
            background-color: transparent !important;
          }
          
          .ios-date-picker .noa-datepicker-day:hover {
            background-color: #f9fafb !important;
          }
          
          .ios-date-picker .noa-datepicker-day.selected {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
          }
          
          /* iOS specific fixes using feature detection */
          @supports (-webkit-touch-callout: none) {
            .ios-date-picker input {
              background: #ffffff;
              background-color: #ffffff;
              opacity: 1;
              -webkit-background-clip: padding-box;
              background-clip: padding-box;
            }
            
            .ios-date-picker .noa-datepicker-popup {
              background: #ffffff;
              background-color: #ffffff;
              -webkit-background-clip: padding-box;
              background-clip: padding-box;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }, []);

    // Handle change and convert Jalaali to Gregorian
    const handleChange = (date: string) => {
      
      setSelectedDate(date);
      onChange(date)
    };

    return (
      <div className="relative w-full">
        <DatePicker
          value={selectedDate}
          placeholderText="Pick a date"
          onChange={(date) => {
            handleChange(date);
          }}
          size="md"
          dayClassName='hover:bg-gray-50'
          className="ios-date-picker"
          dir="rtl"
        />
      </div>
    );
  }
);

PersianDatePicker.displayName = "PersianDatePicker";

export { PersianDatePicker }; 