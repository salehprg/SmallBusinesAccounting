"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DailyIncomeDTO } from '@/lib/api';

interface DailyIncomeChartProps {
  data: DailyIncomeDTO[];
}

export function DailyIncomeChart({ data }: DailyIncomeChartProps) {
  // State to control visibility of each line
  const [visibleLines, setVisibleLines] = useState({
    income: false,
    expenses: false,
    balance: true
  });

  // Toggle visibility of a specific line
  const toggleLineVisibility = (lineKey: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey]
    }));
  };

  // Transform data to calculate cumulative balance and translate days
  const transformedData = useMemo(() => {
    let cumulativeBalance = 0;
    return data.map(item => {
      cumulativeBalance += item.balance;
      return {
        ...item,
        day: item.day,
        cumulativeBalance: cumulativeBalance
      };
    });
  }, [data]);

  // Custom legend click handler
  const handleLegendClick = (data: any) => {
    console.log(data);
    if (data.value) {
      toggleLineVisibility(data.value as keyof typeof visibleLines);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-end">تراز روزانه و بررسی اجمالی</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={transformedData}>
            <XAxis 
              dataKey="day" 
              stroke="#888888" 
              fontSize={12} 
              axisLine={false} 
              tickLine={false}
              tick={{ transform: 'translate(0, 6)' }}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => new Intl.NumberFormat('fa-IR', { 
                notation: 'compact', 
                compactDisplay: 'short' 
              }).format(value)}
              width={40}
            />
            <Tooltip 
              formatter={(value: any, name: string) => {
                const formattedValue = new Intl.NumberFormat('fa-IR').format(value);
                if (name === 'cumulativeBalance') return [formattedValue, 'تراز تجمعی'];
                if (name === 'income') return [formattedValue, 'درآمد'];
                if (name === 'expenses') return [formattedValue, 'هزینه'];
                return [formattedValue, name];
              }}
              labelFormatter={(label) => `روز ${label}`}
              contentStyle={{ textAlign: 'end', direction: 'rtl' }}
              content={(props) => {
                if (props.active && props.payload && props.payload.length > 0) {
                  const data = props.payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md" style={{ direction: 'rtl', textAlign: 'right' }}>
                      <p className="font-medium mb-2">{`روز ${data.day}`}</p>
                      {visibleLines.income && <p className="text-green-600">{`درآمد: ${new Intl.NumberFormat('fa-IR').format(data.income)}`}</p>}
                      {visibleLines.expenses && <p className="text-red-600">{`هزینه: ${new Intl.NumberFormat('fa-IR').format(data.expenses)}`}</p>}
                      {visibleLines.balance && <p className="text-blue-600 font-semibold">{`تراز تجمعی: ${new Intl.NumberFormat('fa-IR').format(data.cumulativeBalance)}`}</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              align="right"
              verticalAlign="top"
              height={36}
              iconType="line"
              onClick={handleLegendClick}
              payload={[
                {
                  value: 'income',
                  type: 'line',
                  color: visibleLines.income ? '#22c55e' : '#ccc'
                },
                {
                  value: 'expenses', 
                  type: 'line',
                  color: visibleLines.expenses ? '#ef4444' : '#ccc'
                },
                {
                  value: 'balance',
                  type: 'line', 
                  color: visibleLines.balance ? '#3b82f6' : '#ccc'
                }
              ]}
              formatter={(value) => {
                const isVisible = visibleLines[value as keyof typeof visibleLines];
                let label = value;
                if (value === 'income') label = 'درآمد';
                if (value === 'expenses') label = 'هزینه';
                if (value === 'balance') label = 'تراز تجمعی';
                return (
                  <span style={{ 
                    color: isVisible ? 'inherit' : '#ccc',
                    textDecoration: isVisible ? 'none' : 'line-through',
                    cursor: 'pointer'
                  }}>
                    {label}
                  </span>
                );
              }}
              wrapperStyle={{ direction: 'rtl', textAlign: 'right' }}
            />
            {/* Income line - Green */}
            {visibleLines.income && (
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#22c55e" 
                strokeWidth={1} 
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                name="income"
              />
            )}
            {/* Expenses line - Red */}
            {visibleLines.expenses && (
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={1} 
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                name="expenses"
              />
            )}
            {/* Cumulative Balance line - Blue (Primary) */}
            {visibleLines.balance && (
              <Line 
                type="monotone" 
                dataKey="cumulativeBalance" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="cumulativeBalance"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 