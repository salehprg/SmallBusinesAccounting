"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Edit, Trash } from 'lucide-react';
import { TransactionsAPI, TransactionDTO, TransactionType } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function FinancialReportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await TransactionsAPI.query({});
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on active tab and search query
  const filteredTransactions = transactions
    .filter(transaction => 
      activeTab === 'all' || 
      (activeTab === 'income' && transaction.transactionType === TransactionType.Income) ||
      (activeTab === 'expense' && transaction.transactionType === TransactionType.Expense)
    )
    .filter(transaction =>
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.toString().includes(searchQuery) ||
      (transaction.date && transaction.date.includes(searchQuery)) ||
      (transaction.costTypeName && transaction.costTypeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.personName && transaction.personName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate financial summary
  const totalIncome = transactions
    .filter(t => t.transactionType === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.transactionType === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  // Group transactions by month for chart
  const monthlyData = Array(12).fill(0).map((_, i) => {
    const monthTransactions = transactions.filter(t => {
      if (!t.date) return false;
      const date = new Date(t.date);
      return date.getMonth() === i;
    });
    
    return {
      month: i + 1,
      amount: monthTransactions.reduce((sum, t) => {
        return t.transactionType === TransactionType.Income ? sum + t.amount : sum - t.amount;
      }, 0),
    };
  });

  // Delete transaction handler
  const handleDeleteTransaction = async (id: number) => {
    setTransactionToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Confirm delete transaction
  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      setIsDeleting(true);
      await TransactionsAPI.delete(transactionToDelete);
      
      // Remove deleted transaction from state
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete));
      setDeleteError(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setDeleteError("حذف تراکنش با خطا مواجه شد");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
    }
  };

  // Edit transaction handler
  const handleEditTransaction = (transaction: TransactionDTO) => {
    // Store the transaction in session storage for the target page to access
    sessionStorage.setItem('editTransaction', JSON.stringify(transaction));
    
    // Redirect to the appropriate page based on transaction type
    if (transaction.transactionType === TransactionType.Income) {
      router.push('/add-income?edit=true');
    } else {
      router.push('/add-expense?edit=true');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">گزارش مالی</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('all')}
        >
          همه
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'income' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('income')}
        >
          درآمد
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'expense' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('expense')}
        >
          هزینه
        </button>
      </div>

      {/* Financial Summary */}
      

      {/* Transactions List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">تراکنش‌های اخیر</h2>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Transactions Table */}
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right">تاریخ</th>
                <th className="p-3 text-right">شرح</th>
                <th className="p-3 text-right">دسته</th>
                <th className="p-3 text-right">مبلغ</th>
                <th className="p-3 text-right">نوع</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-right">{new Date(transaction.date).toLocaleDateString('fa-IR')}</td>
                    <td className="p-3 text-right">{transaction.description}</td>
                    <td className="p-3 text-right">{transaction.costTypeName}</td>
                    <td className="p-3 text-right">{new Intl.NumberFormat('fa-IR').format(transaction.amount)} ریال</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.transactionType === TransactionType.Income ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.transactionType === TransactionType.Income ? 'درآمد' : 'هزینه'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditTransaction(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">ویرایش</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">حذف</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    هیچ تراکنشی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              نمایش {paginatedTransactions.length} از {filteredTransactions.length} تراکنش
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                قبلی
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                بعدی
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showDeleteConfirm ? '' : 'hidden'}`}
        onClick={() => !isDeleting && setShowDeleteConfirm(false)}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 rtl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">آیا از حذف این تراکنش اطمینان دارید؟</h2>
          <p className="text-gray-600 mb-4">
            این عملیات غیرقابل بازگشت است و تراکنش به طور کامل حذف خواهد شد.
          </p>
          {deleteError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {deleteError}
            </div>
          )}
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              انصراف
            </Button>
            <Button
              onClick={confirmDeleteTransaction}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'در حال حذف...' : 'حذف'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 