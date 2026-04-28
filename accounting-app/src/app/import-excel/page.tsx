import { Metadata } from "next"
import { Suspense } from "react"
import ImportExcelPageClient from "./page-client"

export const metadata: Metadata = {
  title: "آپلود صورتحساب - سیستم حسابداری",
  description: "آپلود و ثبت گروهی تراکنش‌ها از فایل اکسل",
}

export default function ImportExcelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImportExcelPageClient />
    </Suspense>
  )
}

