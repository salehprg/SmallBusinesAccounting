"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon, XIcon, AlertCircleIcon } from "lucide-react"

export interface ToastProps {
  id: string
  type: 'success' | 'error'
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration || 3000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

function Toast({ id, type, message }: ToastProps) {
  const { removeToast } = useToast()

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-[500px]",
        "animate-in slide-in-from-right-full duration-300",
        type === 'success' && "bg-green-50 border-green-200 text-green-800",
        type === 'error' && "bg-red-50 border-red-200 text-red-800"
      )}
    >
      <div className="flex-shrink-0">
        {type === 'success' && (
          <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
            <CheckIcon className="w-4 h-4 text-green-600" />
          </div>
        )}
        {type === 'error' && (
          <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
            <AlertCircleIcon className="w-4 h-4 text-red-600" />
          </div>
        )}
      </div>
      
      <div className="flex-1 text-sm font-medium text-right">
        {message}
      </div>
      
      <button
        onClick={() => removeToast(id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  )
} 