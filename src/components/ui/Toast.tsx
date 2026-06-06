/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface ToastMessage {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
}

type Listener = (toasts: ToastMessage[]) => void
let listeners: Listener[] = []
let toasts: ToastMessage[] = []

export const toast = (
  message: string,
  type: ToastMessage['type'] = 'success'
) => {
  const id = Math.random().toString(36).substring(2, 9)
  toasts = [...toasts, { id, message, type }]
  listeners.forEach((l) => l(toasts))
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    listeners.forEach((l) => l(toasts))
  }, 3000)
}

export function ToastProvider() {
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => setActiveToasts(newToasts)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  if (activeToasts.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md flex-col gap-2">
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex animate-slide-up items-center justify-between gap-3 rounded-full border px-4 py-3 text-xs font-semibold shadow-lg ${
            t.type === 'error'
              ? 'border-destructive/20 bg-destructive text-destructive-foreground'
              : t.type === 'info'
                ? 'border-secondary/20 bg-secondary text-secondary-foreground'
                : 'bg-primary/95 border-primary/20 text-primary-foreground shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
          }`}
        >
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => {
              toasts = toasts.filter((item) => item.id !== t.id)
              listeners.forEach((l) => l(toasts))
            }}
            className="rounded-full p-0.5 text-current opacity-80 hover:bg-white/10 hover:opacity-100 active:scale-95"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}
