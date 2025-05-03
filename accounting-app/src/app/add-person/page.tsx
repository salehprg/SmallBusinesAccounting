"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PersonsAPI, CreatePersonDTO } from '@/lib/api';

export default function AddPersonPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    role: '',
    bankAccountNumber: '',
    description: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    // Here you would typically send data to your API
    const personDTO: CreatePersonDTO = {
      personName: formData.fullName,
      contactNumber: formData.phoneNumber,
      accountNumber: formData.bankAccountNumber,
      personType: formData.role,
      description: formData.description
    };
    PersonsAPI.create(personDTO);
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-end">فرم ثبت شخص جدید</h1>
      </div>

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

        <div className="flex justify-start">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">ثبت شخص</Button>
        </div>
      </form>
    </div>
  );
} 