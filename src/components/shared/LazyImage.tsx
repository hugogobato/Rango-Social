import { useState, type ImgHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  alt: string
  /** Shown when src is missing or fails to load. */
  fallback?: ReactNode
  /** Classes for the wrapper element (sizing / rounding). */
  containerClassName?: string
}

/**
 * Image wrapper (Coil equivalent): native lazy-loading + async decode, a pulsing
 * placeholder until the bytes arrive, a fade-in, and a graceful "Sem foto" fallback.
 */
export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  fallback,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-[#242424] text-xs text-[#808080]',
          containerClassName
        )}
      >
        {fallback ?? 'Sem foto'}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden bg-[#242424]',
        containerClassName
      )}
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  )
}
