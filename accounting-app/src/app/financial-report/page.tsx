"use client";

import React, {Suspense } from 'react';
import FinancialReportPageClient from './page-client';

export default function AddTransactionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FinancialReportPageClient />
    </Suspense>
  );
} 