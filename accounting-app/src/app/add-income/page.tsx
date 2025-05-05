"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function AddIncomePage() {
  // Ensure user is authenticated
  const isAuthenticated = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id') ? parseInt(searchParams.get('id')!, 10) : null;
  const isEditMode = transactionId !== null;
  
  const [income, setIncome] = useState<Partial<CreateTransactionDTO>>({
    name: '',
    description: '',
    amount: 0,
    date: new Date().toISOString(),
    costTypeId: 0,
    transactionType: TransactionType.Income
  });

  const [costTypes, setCostTypes] = useState<CostTypeDTO[]>([]);
  const [persons, setPersons] = useState<PersonDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetchingData(true);
        // Fetch cost types
        const costTypesData = await CostTypesAPI.getAll();
        setCostTypes(costTypesData);
        
        // Fetch customers/persons
        const personsData = await PersonsAPI.getAll();
        setPersons(personsData);
        
        // If in edit mode, fetch transaction data
        if (isEditMode && transactionId) {
          const transactionData = await TransactionsAPI.getById(transactionId);
          
          // Verify this is an income transaction
          if (transactionData.transactionType !== TransactionType.Income) {
            router.push(`/add-expense?id=${transactionId}`);
            return;
          }
          
          setIncome({
            name: transactionData.name,
            description: transactionData.description,
            amount: transactionData.amount,
            date: transactionData.date,
            costTypeId: transactionData.costTypeId,
            transactionType: TransactionType.Income,
            personId: transactionData.personId
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('خطا در بارگیری اطلاعات');
      } finally {
        setIsFetchingData(false);
      }
    };
    
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, isEditMode, transactionId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIncome(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIncome(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIncome(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleDateChange = (date: string) => {
    setIncome(prev => ({ ...prev, date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const transactionData: CreateTransactionDTO = {
        name: income.name || '',
        description: income.description || '',
        amount: income.amount || 0,
        date: income.date || new Date().toISOString(),
        costTypeId: income.costTypeId || 0,
        transactionType: TransactionType.Income,
        personId: income.personId
      };
      
      if (isEditMode && transactionId) {
        await TransactionsAPI.update(transactionId, transactionData);
      } else {
        await TransactionsAPI.create(transactionData);
      }
      
      setSuccess(true);
      
      // Reset form or redirect
      setTimeout(() => {
        router.push('/financial-report');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving income:', err);
      setError(err.response?.data?.message || 'خطا در ثبت درآمد');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  if (isFetchingData) {
    return (
      <div className="p-6 max-w-4xl mx-auto rtl">
        <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'ویرایش درآمد' : 'ثبت درآمد'}</h1>
        <div className="text-center py-8">
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto rtl">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'ویرایش درآمد' : 'ثبت درآمد'}</h1>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {isEditMode ? 'درآمد با موفقیت ویرایش شد!' : 'درآمد با موفقیت ثبت شد!'}
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
              value={income.date || ''}
              onChange={handleDateChange}
              placeholder="انتخاب تاریخ"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block">عنوان درآمد</label>
            <Input 
              id="name"
              name="name"
              value={income.name || ''}
              onChange={handleChange}
              placeholder="عنوان درآمد را وارد کنید"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="block">مبلغ</label>
            <Input 
              id="amount"
              name="amount"
              type="number"
              value={income.amount || ''}
              onChange={handleNumberChange}
              placeholder="۰ تومان"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="personId" className="block">مشتری</label>
            <Select 
              id="personId"
              name="personId"
              value={income.personId?.toString() || ''}
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
              value={income.costTypeId?.toString() || ''}
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
            value={income.description || ''}
            onChange={handleChange}
            placeholder="توضیحات را وارد کنید"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/financial-report')} 
            disabled={isLoading}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'در حال ذخیره...' : isEditMode ? 'به‌روزرسانی' : 'ذخیره'}
          </Button>
        </div>
      </form>
    </div>
  );
} 