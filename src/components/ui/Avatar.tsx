import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false)

  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size]

  return (
    <div
      className={cn(
        'relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-[#2A2A2A] bg-white/5 font-bold text-muted-foreground',
        sizeClass,
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || fallback}
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="uppercase">{fallback.slice(0, 2)}</span>
      )}
    </div>
  )
}
