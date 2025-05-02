"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Persian day numbers
const persianDays = {
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷'
};

interface DailyIncomeChartProps {
  data: Array<{ day: string; amount: number }>;
}

export function DailyIncomeChart({ data }: DailyIncomeChartProps) {
  // Translate the day numbers to Persian
  const translatedData = data.map(item => ({
    ...item,
    day: persianDays[item.day as keyof typeof persianDays] || item.day
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-end">درآمد روزانه</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={translatedData}>
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
              formatter={(value: any) => [new Intl.NumberFormat('fa-IR').format(value), '']}
              labelFormatter={(label) => ''}
              contentStyle={{ textAlign: 'end', direction: 'rtl' }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="var(--chart-1)" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 