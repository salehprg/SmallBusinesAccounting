"use client"

import React, { useMemo, useState } from "react"
import { Upload, CheckCircle2, XCircle, RefreshCcw } from "lucide-react"

import { useRequireAuth } from "@/hooks/useRequireAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import {
  BulkTransactionImportRequestDTO,
  BulkTransactionImportResultDTO,
  BulkTransactionPreviewResponseDTO,
  BulkTransactionPreviewRowDTO,
  TransactionType,
  TransactionsAPI,
} from "@/lib/api"

type RowFilter = "all" | "valid" | "invalid"

function formatTransactionType(t?: TransactionType | null) {
  if (t === TransactionType.Income) return "درآمد"
  if (t === TransactionType.Expense) return "هزینه"
  return "—"
}

function formatCashFa(v: boolean) {
  return v ? "نقد" : "غیرنقد"
}

function safeDateOnly(d: string) {
  // Accept yyyy-mm-dd or ISO; show only date part.
  if (!d) return "—"
  const idx = d.indexOf("T")
  return idx > 0 ? d.slice(0, idx) : d
}

export default function ImportExcelPageClient() {
  const isAuthenticated = useRequireAuth()
  const { addToast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<BulkTransactionPreviewResponseDTO | null>(
    null
  )
  const [commitResult, setCommitResult] =
    useState<BulkTransactionImportResultDTO | null>(null)

  const [filter, setFilter] = useState<RowFilter>("all")
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isCommitLoading, setIsCommitLoading] = useState(false)

  const rowsToShow = useMemo(() => {
    if (!preview) return []
    if (filter === "valid") return preview.rows.filter((r) => r.isValid)
    if (filter === "invalid") return preview.rows.filter((r) => !r.isValid)
    return preview.rows
  }, [preview, filter])

  const invalidCount = preview?.invalidRowsCount ?? 0
  const validCount = preview?.validRowsCount ?? 0
  const totalCount = preview?.totalRows ?? 0

  const canPreview = !!file && !isPreviewLoading && isAuthenticated
  const canCommit =
    !!preview && validCount > 0 && !isCommitLoading && !isPreviewLoading

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreview(null)
    setCommitResult(null)
    setFilter("all")
  }

  const onReset = () => {
    setFile(null)
    setPreview(null)
    setCommitResult(null)
    setFilter("all")
  }

  const onPreview = async () => {
    if (!file) return
    setIsPreviewLoading(true)
    setPreview(null)
    setCommitResult(null)
    try {
      const result = await TransactionsAPI.importPreview(file)
      setPreview(result)
      setFilter("all")
      addToast({
        type: "success",
        message: "پیش‌نمایش فایل با موفقیت دریافت شد",
      })
    } catch (err) {
      console.error("Import preview error:", err)
      addToast({
        type: "error",
        message: "خطا در دریافت پیش‌نمایش فایل",
      })
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const toCommitPayload = (
    p: BulkTransactionPreviewResponseDTO
  ): BulkTransactionImportRequestDTO => {
    const validRows = p.validRows?.length ? p.validRows : p.rows.filter((r) => r.isValid)

    return {
      rows: validRows
        .filter((r) => r.isValid && r.transactionType != null)
        .map((r) => ({
          rowNumber: r.rowNumber,
          name: r.name,
          description: r.description,
          amount: r.amount,
          isCash: r.isCash,
          date: safeDateOnly(r.date),
          transactionType: r.transactionType as TransactionType,
          personId: r.personId ?? null,
          costTypes: [],
        })),
    }
  }

  const onCommit = async () => {
    if (!preview) return

    const payload = toCommitPayload(preview)
    if (payload.rows.length === 0) {
      addToast({
        type: "error",
        message: "هیچ ردیف معتبری برای ثبت وجود ندارد",
      })
      return
    }

    const skipped =
      (preview.validRowsCount ?? 0) - payload.rows.length
    if (skipped > 0) {
      addToast({
        type: "error",
        message: `تعدادی از ردیف‌های معتبر به دلیل ناقص بودن (مثل نوع تراکنش) ثبت نشدند (${skipped} ردیف)`,
      })
    }

    setIsCommitLoading(true)
    try {
      const result = await TransactionsAPI.importCommit(payload)
      setCommitResult(result)
      addToast({
        type: "success",
        message: `ثبت گروهی با موفقیت انجام شد (${result.insertedCount} تراکنش)`,
      })
    } catch (err) {
      console.error("Import commit error:", err)
      addToast({
        type: "error",
        message: "خطا در ثبت گروهی تراکنش‌ها",
      })
    } finally {
      setIsCommitLoading(false)
    }
  }

  const renderRowStatus = (row: BulkTransactionPreviewRowDTO) => {
    if (row.isValid) {
      return (
        <Badge className="gap-1" variant="secondary">
          <CheckCircle2 className="h-3 w-3" />
          معتبر
        </Badge>
      )
    }
    return (
      <Badge className="gap-1" variant="destructive">
        <XCircle className="h-3 w-3" />
        نامعتبر
      </Badge>
    )
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-right">آپلود صورتحساب (Import Excel)</CardTitle>
          <CardDescription className="text-right">
            فایل اکسل را انتخاب کنید، پیش‌نمایش را بررسی کنید و سپس تراکنش‌های معتبر را ثبت کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 space-y-2">
              <div className="text-right text-sm font-medium">فایل اکسل</div>
              <Input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={onPickFile}
              />
              {file ? (
                <div className="text-right text-xs text-muted-foreground">
                  {file.name} ({Math.ceil(file.size / 1024)} KB)
                </div>
              ) : (
                <div className="text-right text-xs text-muted-foreground">
                  فقط فایل‌های اکسل قابل قبول هستند.
                </div>
              )}
            </div>

            <div className="flex gap-2 md:justify-end">
              <Button
                variant="outline"
                onClick={onReset}
                disabled={isPreviewLoading || isCommitLoading}
              >
                <RefreshCcw className="h-4 w-4" />
                پاک کردن
              </Button>

              <Button onClick={onPreview} disabled={!canPreview}>
                <Upload className="h-4 w-4" />
                {isPreviewLoading ? "در حال پردازش..." : "دریافت پیش‌نمایش"}
              </Button>
            </div>
          </div>

          {preview && (
            <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">کل ردیف‌ها: {totalCount}</Badge>
                  <Badge variant="secondary">معتبر: {validCount}</Badge>
                  <Badge variant={invalidCount > 0 ? "destructive" : "outline"}>
                    نامعتبر: {invalidCount}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                  >
                    همه
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === "valid" ? "default" : "outline"}
                    onClick={() => setFilter("valid")}
                  >
                    معتبر
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === "invalid" ? "default" : "outline"}
                    onClick={() => setFilter("invalid")}
                  >
                    نامعتبر
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="max-h-[480px] overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-right font-semibold">ردیف</th>
                        <th className="px-3 py-2 text-right font-semibold">عنوان</th>
                        <th className="px-3 py-2 text-right font-semibold">شرح</th>
                        <th className="px-3 py-2 text-right font-semibold">مبلغ</th>
                        <th className="px-3 py-2 text-right font-semibold">تاریخ</th>
                        <th className="px-3 py-2 text-right font-semibold">نقدی</th>
                        <th className="px-3 py-2 text-right font-semibold">نوع</th>
                        <th className="px-3 py-2 text-right font-semibold">شخص</th>
                        <th className="px-3 py-2 text-right font-semibold">وضعیت</th>
                        <th className="px-3 py-2 text-right font-semibold">خطاها</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsToShow.length === 0 ? (
                        <tr>
                          <td
                            className="px-3 py-6 text-center text-muted-foreground"
                            colSpan={10}
                          >
                            ردیفی برای نمایش وجود ندارد
                          </td>
                        </tr>
                      ) : (
                        rowsToShow.map((r) => (
                          <tr
                            key={r.rowNumber}
                            className="border-b last:border-b-0 hover:bg-accent/30"
                          >
                            <td className="px-3 py-2 text-right tabular-nums">
                              {r.rowNumber}
                            </td>
                            <td className="px-3 py-2 text-right">{r.name || "—"}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">
                              {r.description || "—"}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {r.amount}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {safeDateOnly(r.date)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {<span className={`px-2 py-1 rounded-full text-xs ${r.isCash ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                {formatCashFa(!!r.isCash)}
                              </span>}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs ${r.transactionType === TransactionType.Income ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {formatTransactionType(r.transactionType)}
                              </span>

                            </td>
                            <td className="px-3 py-2 text-right">
                              {r.personName || (r.personId ? `#${r.personId}` : "—")}
                            </td>
                            <td className="px-3 py-2 text-right">{renderRowStatus(r)}</td>
                            <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                              {r.errors?.length ? r.errors.join("، ") : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-right text-sm text-muted-foreground">
            {commitResult ? (
              <div>
                <div>
                  نتیجه ثبت: <span className="font-medium">{commitResult.insertedCount}</span>{" "}
                  تراکنش
                </div>
                <div className="text-xs">
                  شناسه‌های ثبت‌شده:{" "}
                  {commitResult.insertedTransactionIds?.length
                    ? commitResult.insertedTransactionIds.join(", ")
                    : "—"}
                </div>
              </div>
            ) : (
              <div>پس از بررسی، روی «تایید و ثبت» کلیک کنید.</div>
            )}
          </div>

          <Button onClick={onCommit} disabled={!canCommit}>
            {isCommitLoading ? "در حال ثبت..." : "تایید و ثبت"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

