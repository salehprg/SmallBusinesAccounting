"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Search, Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { TransactionsAPI, TransactionDTO, TransactionType, TransactionQueryDTO, CostTypesAPI, CostTypeDTO, PersonsAPI, PersonDTO } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';

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

  // Filter and sort states
  const [costTypes, setCostTypes] = useState<CostTypeDTO[]>([]);
  const [persons, setPersons] = useState<PersonDTO[]>([]);
  const [selectedCostType, setSelectedCostType] = useState<number | undefined>(undefined);
  const [selectedPerson, setSelectedPerson] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Add page size state
  const [pageSize, setPageSize] = useState<number>(10);

  const itemsPerPage = pageSize; // Use dynamic page size instead of hardcoded value

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [costTypesData, personsData] = await Promise.all([
          CostTypesAPI.getAll(),
          PersonsAPI.getAll()
        ]);
        setCostTypes(costTypesData);
        setPersons(personsData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Reset current page when filters change or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedCostType, selectedPerson, startDate, endDate, searchQuery, pageSize]);

  // Fetch transactions with filters and sorting
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);

        const queryParams: TransactionQueryDTO = {
          sortBy,
          sortOrder
        };

        // Add filters based on active tab
        if (activeTab !== 'all') {
          queryParams.transactionType = activeTab === 'income' ? TransactionType.Income : TransactionType.Expense;
        }

        // Add date filters
        if (startDate) {
          queryParams.startDate = new Date(startDate).toISOString();
        }
        if (endDate) {
          queryParams.endDate = new Date(endDate).toISOString();
        }

        // Add other filters
        if (selectedCostType) {
          queryParams.costTypeId = selectedCostType;
        }
        if (selectedPerson) {
          queryParams.personId = selectedPerson;
        }

        const data = await TransactionsAPI.query(queryParams);
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [activeTab, selectedCostType, selectedPerson, startDate, endDate, sortBy, sortOrder]);

  // Filter transactions based on search query (client-side for text search)
  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.amount.toString().includes(searchQuery) ||
    (transaction.costTypeName && transaction.costTypeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (transaction.personName && transaction.personName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize); // Use pageSize instead of itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize, // Use pageSize instead of itemsPerPage
    currentPage * pageSize // Use pageSize instead of itemsPerPage
  );

  // Calculate financial summary
  const totalIncome = transactions
    .filter(t => t.transactionType === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.transactionType === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedCostType(undefined);
    setSelectedPerson(undefined);
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setCurrentPage(1);
  };

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
    // Redirect to the appropriate page based on transaction type with transaction ID
    if (transaction.transactionType === TransactionType.Income) {
      router.push(`/add-income?edit=true&id=${transaction.id}`);
    } else {
      router.push(`/add-expense?edit=true&id=${transaction.id}`);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل درآمد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('fa-IR').format(totalIncome)} ریال
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل هزینه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('fa-IR').format(totalExpense)} ریال
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موجودی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('fa-IR').format(balance)} ریال
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">تراکنش‌های اخیر</h2>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            فیلترها
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-muted/50 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-1">از تاریخ</label>
                <PersianDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="انتخاب تاریخ شروع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تا تاریخ</label>
                <PersianDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="انتخاب تاریخ پایان"
                />
              </div>

              {/* Cost Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">دسته هزینه</label>
                <Select
                  value={selectedCostType?.toString() || ''}
                  onChange={(e) => setSelectedCostType(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <SelectItem value="">همه دسته‌ها</SelectItem>
                  {costTypes.map((costType) => (
                    <SelectItem key={costType.id} value={costType.id.toString()}>
                      {costType.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Person Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">شخص</label>
                <Select
                  value={selectedPerson?.toString() || ''}
                  onChange={(e) => setSelectedPerson(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <SelectItem value="">همه اشخاص</SelectItem>
                  {persons.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.personName}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={clearFilters} variant="outline">
                پاک کردن فیلترها
              </Button>
            </div>
          </div>
        )}

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
                <th className="p-3 text-right">ردیف</th>
                <th className="p-3 text-right">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort('date')}
                  >
                    تاریخ
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="p-3 text-right">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort('name')}
                  >
                    شرح
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="p-3 text-right">دسته</th>
                <th className="p-3 text-right">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort('amount')}
                  >
                    مبلغ
                    {getSortIcon('amount')}
                  </button>
                </th>
                <th className="p-3 text-right">نوع</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-right">{pageSize * (currentPage - 1) + index + 1}</td>
                    <td className="p-3 text-right">{new Date(transaction.date).toLocaleDateString('fa-IR')}</td>
                    <td className="p-3 text-right">{transaction.name}</td>
                    <td className="p-3 text-right">{transaction.costTypeName}</td>
                    <td className="p-3 text-right">{new Intl.NumberFormat('fa-IR').format(transaction.amount)} ریال</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${transaction.transactionType === TransactionType.Income ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
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
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                نمایش {paginatedTransactions.length} از {filteredTransactions.length} تراکنش
              </div>
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">تعداد در صفحه:</label>
                <Select
                  value={pageSize.toString()}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </Select>
              </div>
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