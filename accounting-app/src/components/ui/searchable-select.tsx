import * as React from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchableSelectOption {
  value: string
  label: string
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  allowClear?: boolean
}

const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(
  ({ 
    options, 
    value, 
    onChange, 
    placeholder = "انتخاب کنید", 
    searchPlaceholder = "جستجو...",
    className,
    disabled = false,
    allowClear = true,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options
      return options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [options, searchTerm])

    // Get selected option
    const selectedOption = options.find(option => option.value === value)

    // Handle click outside to close dropdown
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchTerm("")
          setHighlightedIndex(-1)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return

      switch (e.key) {
        case "Enter":
          e.preventDefault()
          if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex].value)
          } else if (!isOpen) {
            setIsOpen(true)
          }
          break
        case "Escape":
          setIsOpen(false)
          setSearchTerm("")
          setHighlightedIndex(-1)
          break
        case "ArrowDown":
          e.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
          } else {
            setHighlightedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            )
          }
          break
        case "ArrowUp":
          e.preventDefault()
          if (isOpen) {
            setHighlightedIndex(prev => 
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            )
          }
          break
      }
    }

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue)
      setIsOpen(false)
      setSearchTerm("")
      setHighlightedIndex(-1)
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.("")
      setSearchTerm("")
    }

    const handleToggle = () => {
      if (disabled) return
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 0)
      }
    }

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        {/* Trigger */}
        <div
          onClick={handleToggle}
          className={cn(
            "border-input placeholder:text-muted-foreground dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none h-9 cursor-pointer flex items-center justify-between",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            disabled && "cursor-not-allowed opacity-50",
            isOpen && "border-ring ring-ring/50 ring-[3px]"
          )}
        >
          <span className={cn(
            "truncate text-right flex-1",
            !selectedOption && "text-gray-500"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {allowClear && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-700 p-0.5 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-500 transition-transform",
              isOpen && "rotate-180"
            )} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border bg-white shadow-lg"
          >
            {/* Search Input */}
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setHighlightedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500 text-right"
              />
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-right">
                  نتیجه‌ای یافت نشد
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none transition-colors text-right",
                      "hover:bg-gray-100",
                      index === highlightedIndex && "bg-gray-100",
                      option.value === value && "bg-blue-50 text-blue-600 font-medium"
                    )}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

SearchableSelect.displayName = "SearchableSelect"

export { SearchableSelect } 