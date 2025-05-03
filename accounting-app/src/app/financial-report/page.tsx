"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { TransactionsAPI, TransactionDTO, TransactionType } from '@/lib/api';

export default function FinancialReportPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base">مانده</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <p className="text-3xl font-bold">{new Intl.NumberFormat('fa-IR').format(balance)}</p>
              <p className="text-sm text-muted-foreground">اختلاف درآمد و هزینه</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base">هزینه کل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <p className="text-3xl font-bold">{new Intl.NumberFormat('fa-IR').format(totalExpense)}</p>
              <p className="text-sm text-muted-foreground">مجموع کل پرداختی‌ها</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base">درآمد کل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <p className="text-3xl font-bold">{new Intl.NumberFormat('fa-IR').format(totalIncome)}</p>
              <p className="text-sm text-muted-foreground">مجموع کل دریافتی‌ها</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>نمودار ماهانه</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <h3 className="mb-4 text-sm text-muted-foreground">خلاصه ماهانه</h3>
          <div className="w-full h-full flex items-end">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full mx-1" 
                  style={{ 
                    height: `${Math.max(10, Math.min(90, Math.abs(data.amount) / 1000000))}%`,
                    maxWidth: '24px',
                    margin: '0 auto',
                    borderRadius: '4px 4px 0 0',
                    backgroundColor: data.amount >= 0 ? '#000' : '#888'
                  }}
                ></div>
                <span className="text-xs mt-2">
                  {['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][index]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
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
    </div>
  );
} 