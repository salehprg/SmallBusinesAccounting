import { Metadata } from 'next';
import AddTransactionPageClient from './page-client';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'ثبت تراکنش - سیستم حسابداری',
  description: 'ثبت درآمد و هزینه',
};

export default function AddTransactionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddTransactionPageClient />
    </Suspense>
  );
} 