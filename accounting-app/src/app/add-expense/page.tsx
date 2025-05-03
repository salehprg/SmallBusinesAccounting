"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import { 
  TransactionsAPI, 
  TransactionType, 
  CreateTransactionDTO,
  CostTypesAPI,
  CostTypeDTO,
  PersonsAPI,
  PersonDTO
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AddExpensePage() {
  // Ensure user is authenticated
  const isAuthenticated = useRequireAuth();
  const router = useRouter();
  
  const [expense, setExpense] = useState<Partial<CreateTransactionDTO>>({
    name: '',
    description: '',
    amount: 0,
    date: new Date().toISOString(),
    costTypeId: 0,
    transactionType: TransactionType.Expense
  });

  const [costTypes, setCostTypes] = useState<CostTypeDTO[]>([]);
  const [persons, setPersons] = useState<PersonDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cost types
        const costTypesData = await CostTypesAPI.getAll();
        setCostTypes(costTypesData);
        
        // Fetch vendors/persons
        const personsData = await PersonsAPI.getAll();
        setPersons(personsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('خطا در بارگیری اطلاعات');
      }
    };
    
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleDateChange = (date: string) => {
    setExpense(prev => ({ ...prev, date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const transactionData: CreateTransactionDTO = {
        name: expense.name || '',
        description: expense.description || '',
        amount: expense.amount || 0,
        date: expense.date || new Date().toISOString(),
        costTypeId: expense.costTypeId || 0,
        transactionType: TransactionType.Expense,
        personId: expense.personId
      };
      
      await TransactionsAPI.create(transactionData);
      setSuccess(true);
      
      // Reset form or redirect
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating expense:', err);
      setError(err.response?.data?.message || 'خطا در ثبت هزینه');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="p-6 max-w-4xl mx-auto rtl">
      <h1 className="text-2xl font-bold mb-6">ثبت هزینه</h1>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          هزینه با موفقیت ثبت شد!
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="date" className="block">تاریخ</label>
            <PersianDatePicker 
              id="date"
              name="date"
              value={expense.date || ''}
              onChange={handleDateChange}
              placeholder="انتخاب تاریخ"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block">عنوان هزینه</label>
            <Input 
              id="name"
              name="name"
              value={expense.name || ''}
              onChange={handleChange}
              placeholder="عنوان هزینه را وارد کنید"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="block">مبلغ</label>
            <Input 
              id="amount"
              name="amount"
              type="number"
              value={expense.amount || ''}
              onChange={handleNumberChange}
              placeholder="۰ تومان"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="personId" className="block">فروشنده</label>
            <Select 
              id="personId"
              name="personId"
              value={expense.personId?.toString() || ''}
              onChange={handleSelectChange}
            >
              <SelectItem value="">انتخاب کنید</SelectItem>
              {persons.map((person) => (
                <SelectItem key={person.id} value={person.id.toString()}>
                  {person.personName}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="costTypeId" className="block">دسته‌بندی</label>
            <Select 
              id="costTypeId"
              name="costTypeId"
              value={expense.costTypeId?.toString() || ''}
              onChange={handleSelectChange}
              required
            >
              <SelectItem value="">انتخاب کنید</SelectItem>
              {costTypes.map((costType) => (
                <SelectItem key={costType.id} value={costType.id.toString()}>
                  {costType.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block">توضیحات</label>
          <Textarea 
            id="description"
            name="description"
            value={expense.description || ''}
            onChange={handleChange}
            placeholder="توضیحات را وارد کنید"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </div>
      </form>
    </div>
  );
} 