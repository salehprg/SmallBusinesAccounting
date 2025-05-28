"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import { Edit, Trash } from 'lucide-react';
import {
  TransactionsAPI,
  TransactionType,
  CreateTransactionDTO,
  TransactionDTO,
  CostTypesAPI,
  CostTypeDTO,
  PersonsAPI,
  PersonDTO
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/ui/toast';

export default function AddTransactionPageClient() {
  // Ensure user is authenticated
  const isAuthenticated = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Transaction type state - default to expense
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.Expense);

  const [transaction, setTransaction] = useState<CreateTransactionDTO>({
    name: '',
    description: '',
    amount: 0,
    date: new Date().toISOString(),
    transactionType: TransactionType.Expense,
    isCash: true
  });

  const [costTypes, setCostTypes] = useState<CostTypeDTO[]>([]);
  const [persons, setPersons] = useState<PersonDTO[]>([]);
  const [lastTransactions, setLastTransactions] = useState<TransactionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Autocomplete states
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<string>('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);

  // Load existing transaction data for editing
  useEffect(() => {
    const loadTransactionForEdit = async () => {
      if (isEditMode) {
        const transactionIdParam = searchParams.get('id');
        if (transactionIdParam) {
          const id = parseInt(transactionIdParam, 10);
          if (!isNaN(id)) {
            try {
              setIsLoading(true);
              const transactionData = await TransactionsAPI.getById(id);

              setTransactionId(transactionData.id);
              setTransactionType(transactionData.transactionType);
              setTransaction({
                name: transactionData.name,
                description: transactionData.description,
                amount: transactionData.amount,
                date: transactionData.date,
                costTypeId: transactionData.costTypeId,
                transactionType: transactionData.transactionType,
                personId: transactionData.personId,
                isCash: transactionData.isCash
              });

              nameInputRef.current?.focus();

              // Show advanced section if any advanced fields have values
              if (transactionData.personId || transactionData.costTypeId || transactionData.description) {
                setShowAdvanced(true);
              }
            } catch (error) {
              console.error('Error loading transaction for edit:', error);
              addToast({
                type: 'error',
                message: 'خطا در بارگیری اطلاعات تراکنش'
              });
              setTimeout(() => {
                router.push('/financial-report');
              }, 2000);
            } finally {
              setIsLoading(false);
            }
          } else {
            // Invalid transaction ID
            addToast({
              type: 'error',
              message: 'شناسه تراکنش نامعتبر است'
            });
            setTimeout(() => {
              router.push('/financial-report');
            }, 2000);
          }
        } else {
          // No transaction ID provided but in edit mode
          addToast({
            type: 'error',
            message: 'شناسه تراکنش یافت نشد'
          });
          setTimeout(() => {
            router.push('/financial-report');
          }, 2000);
        }
      }
    };

    loadTransactionForEdit();
  }, [isEditMode, searchParams, router, addToast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cost types
        const costTypesData = await CostTypesAPI.getAll();
        setCostTypes(costTypesData);

        // Fetch persons
        const personsData = await PersonsAPI.getAll();
        setPersons(personsData);

        // Fetch last 10 transactions of current type
        const lastTransactionsData = await TransactionsAPI.getLastTransactions(transactionType, 10);
        setLastTransactions(lastTransactionsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        addToast({
          type: 'error',
          message: 'خطا در بارگیری اطلاعات'
        });
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, addToast, transactionType]);

  // Debounced autocomplete function
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (transaction.name && transaction.name.length > 1) {
        setIsLoadingAutocomplete(true);
        try {
          const suggestions = await TransactionsAPI.getAutoComplete(transaction.name);
          setAutocompleteSuggestions(suggestions);

          // Find the best matching suggestion
          const bestMatch = suggestions.find(suggestion =>
            suggestion.toLowerCase().startsWith(transaction.name.toLowerCase())
          );

          if (bestMatch && bestMatch.toLowerCase() !== transaction.name.toLowerCase()) {
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
  }, [transaction.name]);

  // Update transaction type when switching
  useEffect(() => {
    setTransaction(prev => ({ ...prev, transactionType }));
  }, [transactionType]);

  const handleTransactionTypeChange = (newType: TransactionType) => {
    setTransactionType(newType);
    // Reset form when switching types (except date and payment method)
    const currentDate = transaction.date;
    const currentIsCash = transaction.isCash;
    setTransaction({
      name: '',
      description: '',
      amount: 0,
      date: currentDate,
      transactionType: newType,
      isCash: currentIsCash
    });
    setShowAdvanced(false);
    nameInputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : null }));
  };

  const handleDateChange = (date: string) => {
    setTransaction(prev => ({ ...prev, date }));
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransaction(prev => ({ ...prev, isCash: e.target.value === 'cash' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const transactionData: CreateTransactionDTO = {
        name: transaction.name || '',
        description: transaction.description || '',
        amount: transaction.amount || 0,
        date: transaction.date || "",
        costTypeId: transaction.costTypeId,
        transactionType: transactionType,
        personId: transaction.personId,
        isCash: transaction.isCash
      };

      if (isEditMode && transactionId) {
        // Update existing transaction
        await TransactionsAPI.update(transactionId, transactionData);
        addToast({
          type: 'success',
          message: `${transactionType === TransactionType.Income ? 'درآمد' : 'هزینه'} با موفقیت ویرایش شد!`
        });
      } else {
        // Create new transaction
        await TransactionsAPI.create(transactionData);
        addToast({
          type: 'success',
          message: `${transactionType === TransactionType.Income ? 'درآمد' : 'هزینه'} با موفقیت ثبت شد!`
        });
      }

      const currentDate = transaction.date;
      const currentIsCash = transaction.isCash;
      setTransaction({
        name: '',
        description: '',
        amount: 0,
        date: currentDate,
        transactionType: transactionType,
        isCash: currentIsCash
      });
      setShowAdvanced(false);

      // Redirect back to add transaction mode after successful edit
      setTimeout(() => {
        nameInputRef.current?.focus();
        if (isEditMode)
          router.push('/add-transaction');
      }, 200);

      // Refresh last transactions list
      try {
        const lastTransactionsData = await TransactionsAPI.getLastTransactions(transactionType, 10);
        setLastTransactions(lastTransactionsData);
      } catch (err) {
        console.error('Error refreshing last transactions:', err);
      }
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      addToast({
        type: 'error',
        message: err.response?.data?.message || `خطا در ثبت ${transactionType === TransactionType.Income ? 'درآمد' : 'هزینه'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transactionData: TransactionDTO) => {
    // Redirect to edit mode with the transaction ID
    router.push(`/add-transaction?edit=true&id=${transactionData.id}`);
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id: number) => {
    setTransactionToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Confirm delete transaction
  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      setIsDeleting(true);
      await TransactionsAPI.delete(transactionToDelete);

      // Remove deleted transaction from state and refresh the list
      setLastTransactions(prev => prev.filter(t => t.id !== transactionToDelete));

      // Refresh the list to get updated data
      try {
        const lastTransactionsData = await TransactionsAPI.getLastTransactions(transactionType, 10);
        setLastTransactions(lastTransactionsData);
      } catch (err) {
        console.error('Error refreshing last transactions:', err);
      }

      addToast({
        type: 'success',
        message: 'تراکنش با موفقیت حذف شد'
      });

      // Redirect back to add transaction mode after successful delete
      setTimeout(() => {
        router.push('/add-transaction');
      }, 200);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      addToast({
        type: 'error',
        message: 'خطا در حذف تراکنش'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  const isIncome = transactionType === TransactionType.Income;

  return (
    <div className="p-6 max-w-4xl mx-auto rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? `ویرایش ${isIncome ? 'درآمد' : 'هزینه'}` : 'ثبت تراکنش'}
        </h1>
        
        {/* Transaction Type Switch */}
        {!isEditMode && (
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleTransactionTypeChange(TransactionType.Expense)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isIncome
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              هزینه
            </button>
            <button
              type="button"
              onClick={() => handleTransactionTypeChange(TransactionType.Income)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isIncome
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              درآمد
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="date" className="block">تاریخ</label>
            <PersianDatePicker
              id="date"
              name="date"
              value={transaction.date || ''}
              onChange={handleDateChange}
              placeholder="انتخاب تاریخ"
              required
            />
          </div>

          <div className="space-y-2 relative">
            <label htmlFor="name" className="block">
              عنوان {isIncome ? 'درآمد' : 'هزینه'}
            </label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                value={transaction.name || ''}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && currentSuggestion && showSuggestion) {
                    e.preventDefault();
                    setTransaction(prev => ({ ...prev, name: currentSuggestion }));
                    setShowSuggestion(false);
                    setCurrentSuggestion('');
                  }
                }}
                placeholder={`عنوان ${isIncome ? 'درآمد' : 'هزینه'} را وارد کنید`}
                required
                ref={nameInputRef}
                className="relative z-10 bg-transparent"
                autoComplete="off"
              />
              {/* Autocomplete suggestion overlay */}
              {showSuggestion && currentSuggestion && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="h-full flex items-center px-3 text-gray-400">
                    <span className="invisible">{transaction.name}</span>
                    <span className="text-gray-400">
                      {currentSuggestion.slice(transaction.name?.length || 0)}
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
              value={transaction.amount ? transaction.amount.toLocaleString() : ''}
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
                  const currentValue = transaction.amount || 0;
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
                  checked={transaction.isCash}
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
                  checked={!transaction.isCash}
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
                <label htmlFor="personId" className="block">
                  {isIncome ? 'مشتری' : 'فروشنده'}
                </label>
                <Select
                  id="personId"
                  name="personId"
                  value={transaction.personId?.toString() || ''}
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
                  value={transaction.costTypeId?.toString() || ''}
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
                value={transaction.description || ''}
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

      {/* Last Transactions Table */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">
          آخرین {isIncome ? 'درآمدها' : 'هزینه‌ها'}
        </h2>

        {lastTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-right">ردیف</th>
                  <th className="border border-gray-300 p-3 text-right">تاریخ</th>
                  <th className="border border-gray-300 p-3 text-right">عنوان</th>
                  <th className="border border-gray-300 p-3 text-right">مبلغ</th>
                  <th className="border border-gray-300 p-3 text-right">دسته‌بندی</th>
                  <th className="border border-gray-300 p-3 text-right">
                    {isIncome ? 'مشتری' : 'فروشنده'}
                  </th>
                  <th className="border border-gray-300 p-3 text-right">نوع پرداخت</th>
                  <th className="border border-gray-300 p-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {lastTransactions.map((transactionData, idx) => (
                  <tr key={transactionData.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 text-right">
                      {idx + 1}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {new Date(transactionData.date).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {transactionData.name}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {new Intl.NumberFormat('fa-IR').format(transactionData.amount)} ریال
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {transactionData.costTypeName || '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {transactionData.personName || '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${transactionData.isCash ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {transactionData.isCash ? 'نقدی' : 'غیر نقدی'}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTransaction(transactionData)}
                          className="p-2"
                          title="ویرایش"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transactionData.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            هیچ {isIncome ? 'درآمدی' : 'هزینه‌ای'} یافت نشد
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-right">تأیید حذف</h3>
            <p className="text-right mb-6">آیا از حذف این تراکنش اطمینان دارید؟ این عملیات غیرقابل بازگشت است.</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                لغو
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteTransaction}
                disabled={isDeleting}
              >
                {isDeleting ? 'در حال حذف...' : 'حذف'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 