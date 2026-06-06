import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextProps {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined)

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}) {
  const [localValue, setLocalValue] = useState(defaultValue || '')
  const activeValue = value !== undefined ? value : localValue
  const setActiveValue = onValueChange || setLocalValue

  return (
    <TabsContext.Provider
      value={{ value: activeValue, onValueChange: setActiveValue }}
    >
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex rounded-full border border-[#2A2A2A] bg-[#1E1E1E] p-1',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used inside Tabs')

  const isActive = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        'active:scale-98 flex-1 rounded-full py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used inside Tabs')

  if (context.value !== value) return null

  return (
    <div className={cn('mt-4 focus-visible:outline-none', className)}>
      {children}
    </div>
  )
}
