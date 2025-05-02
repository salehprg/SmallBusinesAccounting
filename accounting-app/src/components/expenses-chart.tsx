"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface ExpensesChartProps {
  data: Array<{ category: string; amount: number; label: string }>;
}

export function ExpensesChart({ data }: ExpensesChartProps) {
  // Get colors from CSS variables
  const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-end">هزینه‌های دسته‌بندی شده</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <XAxis 
              type="number"
              hide
            />
            <YAxis 
              dataKey="label"
              type="category"
              axisLine={false}
              tickLine={false}
              width={80}
              tick={{ fontSize: 12 }}
              style={{ textAnchor: 'end' }}
            />
            <Tooltip
              formatter={(value: any) => [new Intl.NumberFormat('fa-IR').format(value), '']}
              contentStyle={{ textAlign: 'end', direction: 'rtl' }}
            />
            <Bar dataKey="amount" radius={[4, 4, 4, 4]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 