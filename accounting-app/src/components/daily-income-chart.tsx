"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DailyIncomeDTO } from '@/lib/api';

interface DailyIncomeChartProps {
  data: DailyIncomeDTO[];
}

export function DailyIncomeChart({ data }: DailyIncomeChartProps) {
  // Translate the day numbers to Persian
  const translatedData = data.map(item => ({
    ...item,
    day: item.day
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-end">تراز روزانه</CardTitle>
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
              formatter={(value: any, name: string) => {
                const formattedValue = new Intl.NumberFormat('fa-IR').format(value);
                if (name === 'balance') return [formattedValue, 'تراز'];
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
                      <p className="text-green-600">{`درآمد: ${new Intl.NumberFormat('fa-IR').format(data.income)}`}</p>
                      <p className="text-red-600">{`هزینه: ${new Intl.NumberFormat('fa-IR').format(data.expenses)}`}</p>
                      <p className="text-blue-600 font-semibold">{`تراز: ${new Intl.NumberFormat('fa-IR').format(data.balance)}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
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