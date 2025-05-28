"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PersonsAPI, CreatePersonDTO, PersonDTO } from '@/lib/api';
import { Search, Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function AddPersonPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    role: '',
    bankAccountNumber: '',
    description: ''
  });

  // Table state
  const [persons, setPersons] = useState<PersonDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonDTO | null>(null);

  const itemsPerPage = 10;

  // Fetch persons
  const fetchPersons = async () => {
    try {
      setIsLoading(true);
      const data = await PersonsAPI.getAll();
      setPersons(data);
    } catch (error) {
      console.error("Failed to fetch persons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
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
    try {
      const personDTO: CreatePersonDTO = {
        personName: formData.fullName,
        contactNumber: formData.phoneNumber,
        accountNumber: formData.bankAccountNumber,
        personType: formData.role,
        description: formData.description
      };
      
      if (editingPerson) {
        // Update existing person
        await PersonsAPI.update(editingPerson.id, personDTO);
        setEditingPerson(null);
      } else {
        // Create new person
        await PersonsAPI.create(personDTO);
      }
      
      // Reset form and refresh list
      setFormData({
        fullName: '',
        phoneNumber: '',
        role: '',
        bankAccountNumber: '',
        description: ''
      });
      await fetchPersons();
    } catch (error) {
      console.error("Failed to save person:", error);
    }
  };

  // Filter and sort persons
  const filteredPersons = persons
    .filter(person =>
      person.personName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const comparison = a.personName.localeCompare(b.personName, 'fa');
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);
  const paginatedPersons = filteredPersons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Get sort icon
  const getSortIcon = () => {
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Handle edit
  const handleEdit = (person: PersonDTO) => {
    setEditingPerson(person);
    setFormData({
      fullName: person.personName,
      phoneNumber: person.contactNumber || '',
      role: person.personType || '',
      bankAccountNumber: person.accountNumber || '',
      description: person.description || ''
    });
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    setPersonToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (personToDelete) {
      try {
        setIsDeleting(true);
        await PersonsAPI.delete(personToDelete);
        await fetchPersons();
        setShowDeleteConfirm(false);
        setPersonToDelete(null);
      } catch (error) {
        console.error("Failed to delete person:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingPerson(null);
    setFormData({
      fullName: '',
      phoneNumber: '',
      role: '',
      bankAccountNumber: '',
      description: ''
    });
  };

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-end">مدیریت اشخاص</h1>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6 rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-right text-sm font-medium">نام و نام خانوادگی</label>
            <Input 
              id="fullName"
              name="fullName"
              placeholder="نام کامل شخص را وارد کنید"
              value={formData.fullName}
              onChange={handleChange}
              className="text-right"
              dir="rtl"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block text-right text-sm font-medium">شماره تماس</label>
            <Input 
              id="phoneNumber"
              name="phoneNumber"
              placeholder="شماره موبایل یا تلفن"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label htmlFor="role" className="block text-right text-sm font-medium">نقش</label>
            <Input 
              id="role"
              name="role"
              placeholder="مثلاً: مشتری، تامین‌کننده، شریک"
              value={formData.role}
              onChange={handleChange}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Bank Account Number */}
          <div className="space-y-2">
            <label htmlFor="bankAccountNumber" className="block text-right text-sm font-medium">شماره حساب بانکی</label>
            <Input 
              id="bankAccountNumber"
              name="bankAccountNumber"
              placeholder="شماره حساب بانکی"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              className="text-right"
              dir="rtl"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-right text-sm font-medium">توضیحات</label>
          <Textarea 
            id="description"
            name="description"
            placeholder="توضیحات اختیاری"
            value={formData.description}
            onChange={handleChange}
            className="text-right min-h-[100px]"
            dir="rtl"
          />
        </div>

        <div className="flex justify-start gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {editingPerson ? 'بروزرسانی شخص' : 'ثبت شخص'}
          </Button>
          {editingPerson && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              لغو ویرایش
            </Button>
          )}
        </div>
      </form>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <h2 className="text-xl font-semibold">لیست اشخاص</h2>
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
        
        {/* Persons Table */}
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right">شناسه</th>
                <th className="p-3 text-right flex justify-end">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={handleSort}
                  >
                    نام و نام خانوادگی
                    {getSortIcon()}
                  </button>
                </th>
                <th className="p-3 text-right">شماره تماس</th>
                <th className="p-3 text-right">نقش</th>
                <th className="p-3 text-right">شماره حساب</th>
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
              ) : paginatedPersons.length > 0 ? (
                paginatedPersons.map((person) => (
                  <tr key={person.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-right">{person.id}</td>
                    <td className="p-3 text-right">{person.personName}</td>
                    <td className="p-3 text-right">{person.contactNumber || '-'}</td>
                    <td className="p-3 text-right">{person.personType || '-'}</td>
                    <td className="p-3 text-right">{person.accountNumber || '-'}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(person)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">ویرایش</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(person.id)}
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
                    هیچ شخصی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              نمایش {((currentPage - 1) * itemsPerPage) + 1} تا {Math.min(currentPage * itemsPerPage, filteredPersons.length)} از {filteredPersons.length} مورد
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
            <p className="text-right mb-6">آیا از حذف این شخص اطمینان دارید؟</p>
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