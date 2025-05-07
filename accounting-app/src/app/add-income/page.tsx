"use client";

import React, {Suspense } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import AddIncomePageClient from './page-client';

export default function AddIncomePage() {
  // Ensure user is authenticated
  const isAuthenticated = useRequireAuth();
  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddIncomePageClient />
    </Suspense>
  );
} 