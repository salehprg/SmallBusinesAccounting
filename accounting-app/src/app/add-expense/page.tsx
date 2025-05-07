"use client";

import React, { Suspense } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import AddExpensePageClient from './page-client';

export default function AddExpensePage() {
  // Ensure user is authenticated
  const isAuthenticated = useRequireAuth();

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddExpensePageClient />
    </Suspense>
  );
} 