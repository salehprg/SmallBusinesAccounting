"use client";

import React, { useState, useEffect, useRef } from 'react';
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

export default function AddExpensePageClient() {
  // Ensure user is authenticated
  const isAuthenticated = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [expense, setExpense] = useState<CreateTransactionDTO>({
    name: '',
    description: '',
    amount: 0,
    date: new Date().toISOString(),
    transactionType: TransactionType.Expense,
    isCash: true
  });

  const [costTypes, setCostTypes] = useState<CostTypeDTO[]>([]);
  const [persons, setPersons] = useState<PersonDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Autocomplete states
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<string>('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);

  // Load existing transaction data for editing
  useEffect(() => {
    if (isEditMode && typeof window !== 'undefined') {
      const storedTransaction = sessionStorage.getItem('editTransaction');
      if (storedTransaction) {
        try {
          const transaction = JSON.parse(storedTransaction);
          if (transaction.transactionType === TransactionType.Expense) {
            setTransactionId(transaction.id);
            setExpense({
              name: transaction.name,
              description: transaction.description,
              amount: transaction.amount,
              date: transaction.date,
              costTypeId: transaction.costTypeId,
              transactionType: TransactionType.Expense,
              personId: transaction.personId,
              isCash: transaction.isCash
            });

            // Show advanced section if any advanced fields have values
            if (transaction.personId || transaction.costTypeId || transaction.description) {
              setShowAdvanced(true);
            }
          } else {
            // If not an expense transaction, redirect back
            router.push('/financial-report');
          }
          // Clear session storage after retrieval
          sessionStorage.removeItem('editTransaction');
        } catch (error) {
          console.error('Error parsing stored transaction', error);
          setError('خطا در بارگیری اطلاعات تراکنش');
        }
      } else {
        // If no transaction data found but in edit mode, redirect back
        router.push('/financial-report');
      }
    }
  }, [isEditMode, router]);

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

  // Debounced autocomplete function
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (expense.name && expense.name.length > 1) {
        setIsLoadingAutocomplete(true);
        try {
          const suggestions = await TransactionsAPI.getAutoComplete(expense.name);
          setAutocompleteSuggestions(suggestions);
          
          // Find the best matching suggestion
          const bestMatch = suggestions.find(suggestion => 
            suggestion.toLowerCase().startsWith(expense.name.toLowerCase())
          );
          
          if (bestMatch && bestMatch.toLowerCase() !== expense.name.toLowerCase()) {
            setCurrentSuggestion(bestMatch);
            setShowSuggestion(true);
          } else {
            setCurrentSuggestion('');
            setShowSuggestion(false);
          }
        } catch (err) {
          console.error('Error fetching autocomplete:', err);
          setAutocompleteSuggestions([]);
          setCurrentSuggestion('');
          setShowSuggestion(false);
        } finally {
          setIsLoadingAutocomplete(false);
        }
      } else {
        setAutocompleteSuggestions([]);
        setCurrentSuggestion('');
        setShowSuggestion(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [expense.name]);

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
    console.log(date);
    setExpense(prev => ({ ...prev, date }));
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpense(prev => ({ ...prev, isCash: e.target.value === 'cash' }));
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
        date: expense.date || "",
        costTypeId: expense.costTypeId,
        transactionType: TransactionType.Expense,
        personId: expense.personId,
        isCash: expense.isCash
      };

      if (isEditMode && transactionId) {
        // Update existing transaction
        await TransactionsAPI.update(transactionId, transactionData);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 1500);
      } else {
        // Create new transaction
        await TransactionsAPI.create(transactionData);
        setSuccess(true);

        // Clear form fields except date and focus on name field
        const currentDate = expense.date;
        setExpense({
          name: '',
          description: '',
          amount: 0,
          date: currentDate,
          transactionType: TransactionType.Expense,
          isCash: true
        });

        // Focus on name field after a short delay
        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);

        setTimeout(() => {
          setSuccess(false);
        }, 1500);

        // setTimeout(() => {
        //   router.push('/');
        // }, 1500);
      }
    } catch (err: any) {
      console.error('Error saving expense:', err);
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
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'ویرایش هزینه' : 'ثبت هزینه'}</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {isEditMode ? 'هزینه با موفقیت ویرایش شد!' : 'هزینه با موفقیت ثبت شد!'}
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

          <div className="space-y-2 relative">
            <label htmlFor="name" className="block">عنوان هزینه</label>
            <div className="relative">
              <Input 
                id="name"
                name="name"
                value={expense.name || ''}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && currentSuggestion && showSuggestion) {
                    e.preventDefault();
                    setExpense(prev => ({ ...prev, name: currentSuggestion }));
                    setShowSuggestion(false);
                    setCurrentSuggestion('');
                  }
                }}
                placeholder="عنوان هزینه را وارد کنید"
                required
                ref={nameInputRef}
                className="relative z-10 bg-transparent"
                autoComplete="off"
              />
              {/* Autocomplete suggestion overlay */}
              {showSuggestion && currentSuggestion && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="h-full flex items-center px-3 text-gray-400">
                    <span className="invisible">{expense.name}</span>
                    <span className="text-gray-400">
                      {currentSuggestion.slice(expense.name?.length || 0)}
                    </span>
                  </div>
                </div>
              )}
              {/* Loading indicator */}
              {isLoadingAutocomplete && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {/* Suggestion hint */}
            {showSuggestion && currentSuggestion && (
              <div className="text-xs text-gray-500">
                برای تکمیل خودکار Tab را فشار دهید
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="block">مبلغ</label>
            <Input
              id="amount"
              name="amount"
              type="text"
              value={expense.amount ? expense.amount.toLocaleString() : ''}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                const numberValue = parseFloat(value) || 0;
                handleNumberChange({
                  target: {
                    name: 'amount',
                    value: numberValue.toString()
                  }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              onKeyDown={(e) => {
                if (e.key === '.') {
                  e.preventDefault();
                  const currentValue = expense.amount || 0;
                  const newValue = currentValue * 1000;
                  handleNumberChange({
                    target: {
                      name: 'amount',
                      value: newValue.toString()
                    }
                  } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
              placeholder="۰ ریال"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block">نوع پرداخت</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={expense.isCash}
                  onChange={handlePaymentMethodChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span>نقدی</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="non-cash"
                  checked={!expense.isCash}
                  onChange={handlePaymentMethodChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span>غیر نقدی</span>
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Section Toggle */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>{showAdvanced ? 'پنهان کردن تنظیمات پیشرفته' : 'نمایش تنظیمات پیشرفته'}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Advanced Section */}
        {showAdvanced && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تنظیمات پیشرفته</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        )}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/financial-report')}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'در حال ذخیره...' : isEditMode ? 'ویرایش' : 'ذخیره'}
          </Button>
        </div>
      </form>
    </div>
  );
} 