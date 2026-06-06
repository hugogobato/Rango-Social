import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'error'
}

export function Badge({
  className,
  variant = 'primary',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'bg-primary text-primary-foreground': variant === 'primary',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-accent text-accent-foreground': variant === 'accent',
          'border border-[#333333] text-foreground': variant === 'outline',
          'bg-destructive text-destructive-foreground': variant === 'error',
        },
        className
      )}
      {...props}
    />
  )
}
