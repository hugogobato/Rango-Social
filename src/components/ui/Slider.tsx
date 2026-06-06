import { type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string
  min?: number
  max?: number
  value: number
  onChangeValue: (value: number) => void
}

export function Slider({
  label,
  min = 0,
  max = 10,
  value,
  onChangeValue,
  className,
  ...props
}: SliderProps) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>{label}</span>
          <span className="font-bold text-primary">{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChangeValue(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#2A2A2A] accent-primary focus:outline-none"
        {...props}
      />
    </div>
  )
}
