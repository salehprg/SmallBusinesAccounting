import React from 'react'
import { Calendar } from "lucide-react"
import { cn } from '@/lib/utils'

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type="date"
          className={cn(
            "border-input placeholder:text-muted-foreground dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none h-9 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none opacity-50" />
      </div>
    )
  }
)

DatePicker.displayName = "DatePicker"

export { DatePicker } 