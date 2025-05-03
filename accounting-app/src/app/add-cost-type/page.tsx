"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PersonsAPI, CreatePersonDTO, CostTypeDTO, CostTypesAPI, CreateCostTypeDTO } from '@/lib/api';

export default function AddCostTypePage () {
  const [formData, setFormData] = useState({
    name: '',
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
    const costTypeDTO: CreateCostTypeDTO = {
      name: formData.name,
    };
    CostTypesAPI.create(costTypeDTO);
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
              id="name"
              name="name"
              placeholder="نام را وارد کنید"
              value={formData.name}
              onChange={handleChange}
              className="text-right"
              dir="rtl"
            />
          </div>

        </div>
        <div className="flex justify-start">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">ثبت شخص</Button>
        </div>
      </form>
    </div>
  );
} 