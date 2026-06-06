import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Sheet({ isOpen, onClose, children, title }: SheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="p-safe-area fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      {/* Overlay backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet panel */}
      <div
        className={cn(
          'pb-safe-bottom relative z-10 flex max-h-[85vh] w-full max-w-md animate-slide-up flex-col rounded-t-[24px] border-t border-[#2A2A2A] bg-[#1A1A1A] p-6 shadow-2xl transition-all duration-300'
        )}
      >
        {/* Visual Grab Handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/10" />

        {/* Sheet Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>,
    document.body
  )
}
