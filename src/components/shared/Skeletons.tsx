import { Skeleton } from '../ui/Skeleton'
import { Card } from '../ui/Card'

/** Placeholder for a ReviewCard while the feed loads. */
export function ReviewCardSkeleton() {
  return (
    <Card className="space-y-3 overflow-hidden border-[#2D2D2D] bg-[#1A1A1A] p-4">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </Card>
  )
}

/** Placeholder for a restaurant card while discovery loads. */
export function RestaurantCardSkeleton() {
  return (
    <Card className="overflow-hidden border-[#2D2D2D] bg-[#1A1A1A]">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  )
}

/** Generic full-screen fallback for lazily code-split routes. */
export function ScreenSkeleton() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-6" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
