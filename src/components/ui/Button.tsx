import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  pill?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', pill = true, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'active:scale-98 inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(255,107,53,0.2)] hover:opacity-90':
              variant === 'primary',
            'bg-secondary text-secondary-foreground shadow-[0_4px_12px_rgba(123,97,255,0.2)] hover:opacity-90':
              variant === 'secondary',
            'border border-border bg-transparent text-foreground hover:bg-white/5':
              variant === 'outline',
            'bg-transparent text-foreground hover:bg-white/5':
              variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:opacity-90':
              variant === 'destructive',
          },
          {
            'px-2.5 py-1 text-[11px]': size === 'xs',
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          pill ? 'rounded-full' : 'rounded-2xl',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
