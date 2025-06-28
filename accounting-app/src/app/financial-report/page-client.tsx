"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Search, Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown, Filter, Save, X, CheckSquare, Square, Users } from 'lucide-react';
import { TransactionsAPI, TransactionDTO, TransactionType, TransactionQueryDTO, CostTypesAPI, CostTypeDTO, PersonsAPI, PersonDTO, CreateTransactionDTO } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function FinancialReportPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Bulk selection states
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [bulkSelectedCostTypes, setBulkSelectedCostTypes] = useState<number[]>([]);
  const [showBulkNameModal, setShowBulkNameModal] = useState(false);
  const [bulkName, setBulkName] = useState<string>('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkUpdateError, setBulkUpdateError] = useState<string | null>(null);

  // Inline editing states
  const [editingTransaction, setEditingTransaction] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<{
    transactionType: TransactionType;
    name: string;
    date: string;
    costTypeIds: number[];
    amount: number;
    isCash: boolean;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Filter and sort states
  const [costTypes, setCostTypes] = useState<CostTypeDTO[]>([]);
  const [persons, setPersons] = useState<PersonDTO[]>([]);
  const [selectedCostTypes, setSelectedCostTypes] = useState<number[]>([]);
  const [selectedNonCostType, setSelectedNonCostType] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [showFilters, setShowFilters] = useState(true);

  // Add page size state
  const [pageSize, setPageSize] = useState<number>(25);

  const itemsPerPage = pageSize; // Use dynamic page size instead of hardcoded value

  // Ref for name input field to auto-focus when inline editing starts
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on name field when inline editing starts
  useEffect(() => {
    if (editingTransaction && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingTransaction]);

  // Load initial data from URL parameters
  useEffect(() => {
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const pageSizeParam = searchParams.get('pageSize');
    const sortByParam = searchParams.get('sortBy');
    const sortOrderParam = searchParams.get('sortOrder');

    if (startDateParam) {
      setStartDate(startDateParam);
    }
    if (endDateParam) {
      setEndDate(endDateParam);
    }
    if (pageSizeParam) {
      setPageSize(parseInt(pageSizeParam));
    }
    if (sortByParam) {
      setSortBy(sortByParam);
    }
    if (sortOrderParam) {
      setSortOrder(sortOrderParam);
    }
  }, [searchParams]);

  // Update URL when dates change
  const updateDateInURL = (newStartDate: string, newEndDate: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newStartDate) {
      params.set('startDate', newStartDate);
    } else {
      params.delete('startDate');
    }

    if (newEndDate) {
      params.set('endDate', newEndDate);
    } else {
      params.delete('endDate');
    }

    router.replace(`/financial-report?${params.toString()}`, { scroll: false });
  };

  // Update URL when page size changes
  const updatePageSizeInURL = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newPageSize.toString());
    router.replace(`/financial-report?${params.toString()}`, { scroll: false });
  };

  // Update URL when sort changes
  const updateSortInURL = (newSortBy: string, newSortOrder: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', newSortBy);
    params.set('sortOrder', newSortOrder);
    router.replace(`/financial-report?${params.toString()}`, { scroll: false });
  };

  // Custom setters that update URL
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    updateDateInURL(date, endDate);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    updateDateInURL(startDate, date);
  };

  // Custom page size handler
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    updatePageSizeInURL(newPageSize);
  };

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
  }, [activeTab, selectedCostTypes, selectedNonCostType, selectedPerson, startDate, endDate, minAmount, maxAmount, searchQuery, pageSize]);

  // Fetch transactions with filters and sorting
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);

        const queryParams: TransactionQueryDTO = {
          sortBy,
          sortOrder,
          nonCostType: selectedNonCostType
        };

        // Add filters based on active tab
        if (activeTab !== 'all') {
          queryParams.transactionType = activeTab === 'income' ? TransactionType.Income : TransactionType.Expense;
        }

        // Add date filters
        if (startDate) {
          queryParams.startDate = new Date(startDate).toISOString().split("T")[0];
        }
        if (endDate) {
          queryParams.endDate = new Date(endDate).toISOString().split("T")[0];
        }

        // Add other filters
        if (!selectedNonCostType && selectedCostTypes.length > 0) {
          queryParams.costTypeIds = selectedCostTypes;
        }
        if (selectedPerson) {
          queryParams.personId = selectedPerson;
        }
        if (minAmount) {
          queryParams.minAmount = parseInt(minAmount);
        }
        if (maxAmount) {
          queryParams.maxAmount = parseInt(maxAmount);
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
  }, [activeTab, selectedCostTypes, selectedNonCostType, selectedPerson, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder]);

  // Filter transactions based on search query (client-side for text search)
  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    // Add secondary sorting by ID when primary sort is by date
    if (sortBy === 'date') {
      const dateComparison = sortOrder === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();

      // If dates are equal, sort by ID as secondary criterion
      if (dateComparison === 0) {
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      }
      return dateComparison;
    }

    // For other sort fields, no additional client-side sorting needed
    // as the backend API handles the primary sorting
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize); // Use pageSize instead of itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize, // Use pageSize instead of itemsPerPage
    currentPage * pageSize // Use pageSize instead of itemsPerPage
  );

  // Calculate financial summary
  const totalIncome = filteredTransactions
    .filter(t => t.transactionType === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.transactionType === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Handle sorting
  const handleSort = (field: string) => {
    let newSortOrder: string;
    if (sortBy === field) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      newSortOrder = 'desc';
    }

    setSortBy(field);
    setSortOrder(newSortOrder);
    updateSortInURL(field, newSortOrder);
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Handle cost type selection with special "no category" option
  const handleCostTypeChange = (values: string[]) => {
    const nonCostTypeValue = 'no-category';
    
    if (values.includes(nonCostTypeValue)) {
      // If "بدون دسته بندی" is selected, clear other selections and set nonCostType to true
      setSelectedCostTypes([]);
      setSelectedNonCostType(true);
    } else {
      // Normal cost type selection
      setSelectedCostTypes(values.map(Number));
      setSelectedNonCostType(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedCostTypes([]);
    setSelectedNonCostType(false);
    setSelectedPerson(undefined);
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSearchQuery('');
    setCurrentPage(1);

    // Reset to defaults
    setSortBy('date');
    setSortOrder('desc');
    setPageSize(10);

    // Clear URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.delete('startDate');
    params.delete('endDate');
    params.delete('sortBy');
    params.delete('sortOrder');
    params.delete('pageSize');
    router.replace(`/financial-report?${params.toString()}`, { scroll: false });
  };

  // Bulk selection handlers
  const handleSelectTransaction = (transactionId: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === paginatedTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(paginatedTransactions.map(t => t.id)));
    }
  };

  const handleBulkAssignCategory = () => {
    if (selectedTransactions.size === 0) return;
    setBulkSelectedCostTypes([]);
    setBulkUpdateError(null);
    setShowBulkCategoryModal(true);
  };

  const handleBulkAssignName = () => {
    if (selectedTransactions.size === 0) return;
    setBulkName('');
    setBulkUpdateError(null);
    setShowBulkNameModal(true);
  };

  const handleBulkCategoryUpdate = async () => {
    if (bulkSelectedCostTypes.length === 0) {
      setBulkUpdateError('لطفاً حداقل یک دسته‌بندی انتخاب کنید');
      return;
    }

    try {
      setIsBulkUpdating(true);
      setBulkUpdateError(null);

      // Update each selected transaction
      const updatePromises = Array.from(selectedTransactions).map(async (transactionId) => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return null;

        const updatedTransactionRequest: CreateTransactionDTO = {
          ...transaction,
          costTypes: bulkSelectedCostTypes
        };

        return TransactionsAPI.update(transactionId, updatedTransactionRequest);
      });

      const updatedTransactions = await Promise.all(updatePromises);

      // Update local state
      setTransactions(prev => prev.map(t => {
        const updated = updatedTransactions.find(ut => ut && ut.id === t.id);
        return updated || t;
      }));

      // Reset states
      setSelectedTransactions(new Set());
      setShowBulkCategoryModal(false);
      setBulkSelectedCostTypes([]);
    } catch (error) {
      console.error("Error updating transactions:", error);
      setBulkUpdateError("به‌روزرسانی دسته‌بندی‌ها با خطا مواجه شد");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkNameUpdate = async () => {
    if (!bulkName.trim()) {
      setBulkUpdateError('لطفاً نام جدید را وارد کنید');
      return;
    }

    try {
      setIsBulkUpdating(true);
      setBulkUpdateError(null);

      // Update each selected transaction
      const updatePromises = Array.from(selectedTransactions).map(async (transactionId) => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return null;

        const updatedTransactionRequest: CreateTransactionDTO = {
          ...transaction,
          name: bulkName.trim(),
          costTypes: transaction.costTypes.map(ct => ct.costTypeId)
        };

        return TransactionsAPI.update(transactionId, updatedTransactionRequest);
      });

      const updatedTransactions = await Promise.all(updatePromises);

      // Update local state
      setTransactions(prev => prev.map(t => {
        const updated = updatedTransactions.find(ut => ut && ut.id === t.id);
        return updated || t;
      }));

      // Reset states
      setSelectedTransactions(new Set());
      setShowBulkNameModal(false);
      setBulkName('');
    } catch (error) {
      console.error("Error updating transaction names:", error);
      setBulkUpdateError("به‌روزرسانی نام‌ها با خطا مواجه شد");
    } finally {
      setIsBulkUpdating(false);
    }
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
    window.open(`/add-transaction?edit=true&id=${transaction.id}`, '_blank');
  };

  // Inline edit handlers
  const handleInlineEdit = (transaction: TransactionDTO) => {
    setEditingTransaction(transaction.id);
    setEditingValues({
      transactionType: transaction.transactionType,
      name: transaction.name,
      date: transaction.date, // Convert to YYYY-MM-DD format for date input
      costTypeIds: transaction.costTypes.map(ct => ct.costTypeId),
      amount: transaction.amount,
      isCash: transaction.isCash
    });
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditingValues(null);
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction || !editingValues) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      // Find the original transaction
      const originalTransaction = transactions.find(t => t.id === editingTransaction);
      if (!originalTransaction) return;

      // Create updated transaction object
      const updatedTransactionRequest: CreateTransactionDTO = {
        ...originalTransaction,
        amount: editingValues.amount,
        transactionType: editingValues.transactionType,
        name: editingValues.name,
        date: new Date(editingValues.date).toISOString().split("T")[0],
        costTypes: editingValues.costTypeIds,
        isCash: editingValues.isCash
      };

      // Update via API
      const updatedTransaction = await TransactionsAPI.update(editingTransaction, updatedTransactionRequest);

      // Update local state
      setTransactions(prev => prev.map(t =>
        t.id === editingTransaction ? updatedTransaction : t
      ));

      // Reset editing state
      setEditingTransaction(null);
      setEditingValues(null);
    } catch (error) {
      console.error("Error saving transaction:", error);
      setSaveError("ذخیره تغییرات با خطا مواجه شد");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditValueChange = (field: string, value: any) => {
    if (!editingValues) return;
    setEditingValues(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  // Handle Enter key press to save inline edit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
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
                  onChange={handleStartDateChange}
                  placeholder="انتخاب تاریخ شروع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تا تاریخ</label>
                <PersianDatePicker
                  value={endDate}
                  onChange={handleEndDateChange}
                  placeholder="انتخاب تاریخ پایان"
                />
              </div>

              {/* Cost Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">دسته هزینه</label>
                <MultiSelect
                  options={[
                    { label: 'بدون دسته بندی', value: 'no-category' },
                    ...costTypes.map((costType) => ({
                      label: costType.name,
                      value: costType.id.toString()
                    }))
                  ]}
                  onValueChange={handleCostTypeChange}
                  defaultValue={selectedNonCostType ? ['no-category'] : selectedCostTypes.map(id => id.toString())}
                  placeholder="انتخاب دسته‌ها"
                  variant="inverted"
                  maxCount={3}
                />
              </div>

              {/* Person Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">شخص</label>
                <SearchableSelect
                  options={persons.map((person) => ({
                    value: person.id.toString(),
                    label: `${person.personName} (${person.accountNumber})`
                  }))}
                  value={selectedPerson?.toString() || ''}
                  onChange={(e) => setSelectedPerson(e ? Number(e) : undefined)}
                  placeholder="انتخاب کنید"
                  searchPlaceholder="جستجو در لیست..."
                />
              </div>
            </div>

            {/* Amount Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">حداقل مبلغ (ریال)</label>
                <Input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="حداقل مبلغ..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">حداکثر مبلغ (ریال)</label>
                <Input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="حداکثر مبلغ..."
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={clearFilters} variant="outline">
                پاک کردن فیلترها
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedTransactions.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedTransactions.size} تراکنش انتخاب شده
                </span>
              </div>
                             <div className="flex gap-2">
                 <Button
                   onClick={handleBulkAssignCategory}
                   className="bg-blue-600 hover:bg-blue-700"
                   size="sm"
                 >
                   تخصیص دسته‌بندی
                 </Button>
                 <Button
                   onClick={handleBulkAssignName}
                   className="bg-green-600 hover:bg-green-700"
                   size="sm"
                 >
                   تنظیم نام
                 </Button>
                 <Button
                   onClick={() => setSelectedTransactions(new Set())}
                   variant="outline"
                   size="sm"
                 >
                   لغو انتخاب
                 </Button>
               </div>
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
        <div className="border rounded-md overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-right w-12">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center w-5 h-5 hover:bg-gray-200 rounded"
                    >
                      {selectedTransactions.size === paginatedTransactions.length && paginatedTransactions.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
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
                      نام
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="p-3 text-right">توضیحات</th>
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
                  <th className="p-3 text-right">نقدی/غیرنقدی</th>
                  <th className="p-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center">
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      {/* Selection Checkbox */}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleSelectTransaction(transaction.id)}
                          className="flex items-center justify-center w-5 h-5 hover:bg-gray-200 rounded"
                        >
                          {selectedTransactions.has(transaction.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      <td className="p-3 text-right whitespace-nowrap">{pageSize * (currentPage - 1) + index + 1}</td>

                      {/* Date Column */}
                      <td className="p-3 text-right whitespace-nowrap">
                        {editingTransaction === transaction.id ? (
                          <PersianDatePicker
                            id="date"
                            name="date"
                            value={editingValues?.date || ''}
                            onChange={(e) => handleEditValueChange('date', e)}
                            placeholder="انتخاب تاریخ"
                            required
                          />
                        ) : (
                          new Date(transaction.date).toLocaleDateString('fa-IR')
                        )}
                      </td>

                      {/* Name Column */}
                      <td className="p-3 text-right">
                        {editingTransaction === transaction.id ? (
                          <Input
                            value={editingValues?.name || ''}
                            onChange={(e) => handleEditValueChange('name', e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="min-w-32"
                            ref={nameInputRef}
                          />
                        ) : (
                          <div className="max-w-48 truncate" title={transaction.name}>
                            {transaction.name}
                          </div>
                        )}
                      </td>

                      {/* Description Column */}
                      <td className="p-3 text-right">
                        <div className="max-w-32 truncate" title={transaction.description}>
                          {transaction.description.length > 20 
                            ? `${transaction.description.substring(0, 20)}...` 
                            : transaction.description}
                        </div>
                      </td>

                      {/* Category Column */}
                      <td className="p-3 text-right whitespace-nowrap">
                        {editingTransaction === transaction.id ? (
                          <MultiSelect
                            options={costTypes.map(ct => ({
                              label: ct.name,
                              value: ct.id.toString()
                            }))}
                            onValueChange={(value) => handleEditValueChange('costTypeIds', value.map(Number))}
                            defaultValue={editingValues?.costTypeIds?.map(ct => ct.toString()) || []}
                            placeholder="انتخاب دسته‌بندی"
                            variant="inverted"
                            maxCount={3}
                          />
                        ) : (
                          transaction.costTypes.map(ct => ct.costType.name).join(', ')
                        )}
                      </td>

                      <td className="p-3 text-right whitespace-nowrap">
                        {editingTransaction === transaction.id ? (
                          <Input
                            value={editingValues?.amount || ''}
                            onChange={(e) => handleEditValueChange('amount', parseInt(e.target.value))}
                            onKeyDown={handleKeyDown}
                            className="min-w-32"
                          />
                        ) : (
                          <span>
                            {new Intl.NumberFormat('fa-IR').format(transaction.amount)} ریال
                          </span>
                        )}

                      </td>

                      {/* Transaction Type Column */}
                      <td className="p-3 text-right whitespace-nowrap">
                        {editingTransaction === transaction.id ? (
                          <Select
                            value={editingValues?.transactionType || ''}
                            onChange={(e) => handleEditValueChange('transactionType', parseInt(e.target.value) as unknown as TransactionType)}
                          >
                            <SelectItem value={TransactionType.Income}>درآمد</SelectItem>
                            <SelectItem value={TransactionType.Expense}>هزینه</SelectItem>
                          </Select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${transaction.transactionType === TransactionType.Income ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {transaction.transactionType === TransactionType.Income ? 'درآمد' : 'هزینه'}
                          </span>
                        )}
                      </td>

                      {/* Cash/Non-Cash Column */}
                      <td className="p-3 text-right whitespace-nowrap">
                        {editingTransaction === transaction.id ? (
                          <Select
                            value={editingValues?.isCash ? 'true' : 'false'}
                            onChange={(e) => handleEditValueChange('isCash', e.target.value === 'true')}
                          >
                            <SelectItem value="true">نقدی</SelectItem>
                            <SelectItem value="false">غیرنقدی</SelectItem>
                          </Select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${transaction.isCash ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                            {transaction.isCash ? 'نقدی' : 'غیرنقدی'}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex gap-2 justify-end">
                          {editingTransaction === transaction.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Save className="h-4 w-4" />
                                <span className="sr-only">ذخیره</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">انصراف</span>
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleInlineEdit(transaction)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="ویرایش سریع"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">ویرایش سریع</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTransaction(transaction)}
                                className="h-8 w-8 p-0"
                                title="ویرایش کامل"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">ویرایش کامل</span>
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-muted-foreground">
                      هیچ تراکنشی یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Error Message */}
        {saveError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {saveError}
          </div>
        )}

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
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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

      {/* Bulk Category Assignment Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showBulkCategoryModal ? '' : 'hidden'}`}
        onClick={() => !isBulkUpdating && setShowBulkCategoryModal(false)}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 rtl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">تخصیص دسته‌بندی به تراکنش‌های انتخاب شده</h2>
          <p className="text-gray-600 mb-4">
            {selectedTransactions.size} تراکنش انتخاب شده است. دسته‌بندی‌های جدید را انتخاب کنید:
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">دسته‌بندی‌ها</label>
            <MultiSelect
              options={costTypes.map(ct => ({
                label: ct.name,
                value: ct.id.toString()
              }))}
              onValueChange={(value) => setBulkSelectedCostTypes(value.map(Number))}
              defaultValue={bulkSelectedCostTypes.map(ct => ct.toString())}
              placeholder="انتخاب دسته‌بندی‌ها"
              variant="inverted"
              maxCount={5}
            />
          </div>

          {bulkUpdateError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {bulkUpdateError}
            </div>
          )}

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkCategoryModal(false)}
              disabled={isBulkUpdating}
            >
              انصراف
            </Button>
            <Button
              onClick={handleBulkCategoryUpdate}
              disabled={isBulkUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isBulkUpdating ? 'در حال به‌روزرسانی...' : 'اعمال تغییرات'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Name Assignment Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showBulkNameModal ? '' : 'hidden'}`}
        onClick={() => !isBulkUpdating && setShowBulkNameModal(false)}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 rtl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">تنظیم نام برای تراکنش‌های انتخاب شده</h2>
          <p className="text-gray-600 mb-4">
            {selectedTransactions.size} تراکنش انتخاب شده است. نام جدید را وارد کنید:
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">نام جدید</label>
            <Input
              value={bulkName}
              onChange={(e) => setBulkName(e.target.value)}
              placeholder="نام جدید را وارد کنید..."
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleBulkNameUpdate();
                }
              }}
            />
          </div>

          {bulkUpdateError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {bulkUpdateError}
            </div>
          )}

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkNameModal(false)}
              disabled={isBulkUpdating}
            >
              انصراف
            </Button>
            <Button
              onClick={handleBulkNameUpdate}
              disabled={isBulkUpdating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isBulkUpdating ? 'در حال به‌روزرسانی...' : 'اعمال تغییرات'}
            </Button>
          </div>
        </div>
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