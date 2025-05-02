"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { expensesData } from '@/lib/mock-data';

export default function AddExpensePage() {
  const [expense, setExpense] = useState({
    date: '',
    type: '',
    description: '',
    amount: '',
    vendor: '',
    category: '',
    billable: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Expense data:', expense);
    // Here you would send the data to the server
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add expense</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="date" className="block">Date</label>
          <DatePicker 
            id="date"
            name="date"
            value={expense.date}
            onChange={handleChange}
            placeholder="Select date"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="block">Expense type</label>
          <Select 
            id="type"
            name="type"
            value={expense.type}
            onChange={handleChange}
            required
          >
            <SelectItem value="">Select</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="administrative">Administrative</SelectItem>
            <SelectItem value="material">Material</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block">Description</label>
          <Textarea 
            id="description"
            name="description"
            value={expense.description}
            onChange={handleChange}
            placeholder="Enter description"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="block">Amount</label>
          <Input 
            id="amount"
            name="amount"
            type="number"
            value={expense.amount}
            onChange={handleChange}
            placeholder="$0.00"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="vendor" className="block">Vendor</label>
          <Select 
            id="vendor"
            name="vendor"
            value={expense.vendor}
            onChange={handleChange}
            required
          >
            <SelectItem value="">Select</SelectItem>
            <SelectItem value="vendor1">Vendor 1</SelectItem>
            <SelectItem value="vendor2">Vendor 2</SelectItem>
            <SelectItem value="vendor3">Vendor 3</SelectItem>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block">Category</label>
          <Select 
            id="category"
            name="category"
            value={expense.category}
            onChange={handleChange}
            required
          >
            <SelectItem value="">Select</SelectItem>
            {expensesData.map((category) => (
              <SelectItem key={category.category} value={category.category}>
                {category.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="billable" className="block">Billable to client</label>
          <Select 
            id="billable"
            name="billable"
            value={expense.billable}
            onChange={handleChange}
            required
          >
            <SelectItem value="">Select</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
} 