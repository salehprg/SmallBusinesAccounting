import { Metadata } from 'next';
import AddTransactionPageClient from './page-client';

export const metadata: Metadata = {
  title: 'ثبت تراکنش - سیستم حسابداری',
  description: 'ثبت درآمد و هزینه',
};

export default function AddTransactionPage() {
  return <AddTransactionPageClient />;
} 