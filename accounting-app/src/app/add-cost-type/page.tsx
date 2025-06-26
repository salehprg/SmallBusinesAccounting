"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PersonsAPI, CreatePersonDTO, CostTypeDTO, CostTypesAPI, CreateCostTypeDTO } from '@/lib/api';
import { Search, Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function AddCostTypePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Table state
  const [costTypes, setCostTypes] = useState<CostTypeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'id' | 'name'>('id');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [costTypeToDelete, setCostTypeToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCostType, setEditingCostType] = useState<CostTypeDTO | null>(null);

  const { addToast } = useToast();
  const itemsPerPage = 10;

  // Fetch cost types
  const fetchCostTypes = async () => {
    try {
      setIsLoading(true);
      const data = await CostTypesAPI.getAll();
      setCostTypes(data);
    } catch (error) {
      console.error("Failed to fetch cost types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCostTypes();
  }, []);

  // Reset current page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addToast({
        type: 'error',
        message: 'نام نوع هزینه الزامی است'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const costTypeDTO: CreateCostTypeDTO = {
        name: formData.name.trim(),
      };

      if (editingCostType) {
        // Update existing cost type
        await CostTypesAPI.update(editingCostType.id, costTypeDTO);
        setEditingCostType(null);
        addToast({
          type: 'success',
          message: 'نوع هزینه با موفقیت بروزرسانی شد'
        });
      } else {
        // Create new cost type
        await CostTypesAPI.create(costTypeDTO);
        addToast({
          type: 'success',
          message: 'نوع هزینه با موفقیت ثبت شد'
        });
      }

      // Reset form and refresh list
      setFormData({ name: '', description: '' });
      await fetchCostTypes();
    } catch (error) {
      console.error("Failed to save cost type:", error);
      addToast({
        type: 'error',
        message: editingCostType ? 'خطا در بروزرسانی نوع هزینه' : 'خطا در ثبت نوع هزینه'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and sort cost types
  const filteredCostTypes = costTypes
    .filter(costType =>
      costType.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id - b.id;
      } else {
        comparison = a.name.localeCompare(b.name, 'fa');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCostTypes.length / itemsPerPage);
  const paginatedCostTypes = filteredCostTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'id' | 'name') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: 'id' | 'name') => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Handle edit
  const handleEdit = (costType: CostTypeDTO) => {
    setEditingCostType(costType);
    setFormData({
      name: costType.name,
      description: ''
    });
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    setCostTypeToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (costTypeToDelete) {
      try {
        setIsDeleting(true);
        await CostTypesAPI.delete(costTypeToDelete);
        await fetchCostTypes();
        setShowDeleteConfirm(false);
        setCostTypeToDelete(null);
        addToast({
          type: 'success',
          message: 'نوع هزینه با موفقیت حذف شد'
        });
      } catch (error) {
        console.error("Failed to delete cost type:", error);
        addToast({
          type: 'error',
          message: 'خطا در حذف نوع هزینه'
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingCostType(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-end">مدیریت انواع هزینه</h1>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6 rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-right text-sm font-medium">
              نوع هزینه
            </label>
            <Input
              id="name"
              name="name"
              placeholder="نام را وارد کنید"
              value={formData.name}
              onChange={handleChange}
              className="text-right"
              dir="rtl"
              required
            />
          </div>
        </div>
        <div className="flex justify-start gap-2">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {editingCostType ? 'در حال بروزرسانی...' : 'در حال ثبت...'}
              </div>
            ) : (
              editingCostType ? 'بروزرسانی نوع هزینه' : 'ثبت نوع هزینه'
            )}
          </Button>
          {editingCostType && (
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={isSubmitting}>
              لغو ویرایش
            </Button>
          )}
        </div>
      </form>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <h2 className="text-xl font-semibold">لیست انواع هزینه</h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            dir="rtl"
          />
        </div>

        {/* Cost Types Table */}
        <div className="border rounded-md overflow-hidden">
          <div className="min-w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-right">
                    <button
                      className="flex items-center gap-1 hover:text-primary justify-end w-full"
                      onClick={() => handleSort('id')}
                    >
                      شناسه
                      {getSortIcon('id')}
                    </button>
                  </th>
                  <th className="p-3 text-right">
                    <button
                      className="flex items-center gap-1 hover:text-primary justify-end w-full"
                      onClick={() => handleSort('name')}
                    >
                      نام نوع هزینه
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="p-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center">
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : paginatedCostTypes.length > 0 ? (
                  paginatedCostTypes.map((costType) => (
                    <tr key={costType.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-right">{costType.id}</td>
                      <td className="p-3 text-right">{costType.name}</td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(costType)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">ویرایش</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(costType.id)}
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
                    <td colSpan={3} className="p-6 text-center text-muted-foreground">
                      هیچ نوع هزینه‌ای یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              نمایش {((currentPage - 1) * itemsPerPage) + 1} تا {Math.min(currentPage * itemsPerPage, filteredCostTypes.length)} از {filteredCostTypes.length} مورد
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                قبلی
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                بعدی
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-right">تأیید حذف</h3>
            <p className="text-right mb-6">آیا از حذف این نوع هزینه اطمینان دارید؟</p>
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
                onClick={confirmDelete}
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