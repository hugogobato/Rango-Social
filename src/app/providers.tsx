import { type ReactNode, useEffect } from 'react'
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { createPersistedQueryClient } from '@/lib/query/persist'
import { onAuthChange } from '@/lib/auth'

const queryClient = createPersistedQueryClient()

interface ProvidersProps {
  children: ReactNode
}

/**
 * Keeps the cached session in sync with Supabase Auth. Any sign-in / sign-out /
 * token refresh (incl. from another tab) refetches `sessionUser` so the auth
 * gate and every write that needs `auth.uid()` see the current identity.
 */
function AuthSync() {
  const client = useQueryClient()
  useEffect(() => {
    return onAuthChange(() => {
      client.invalidateQueries({ queryKey: ['sessionUser'] })
    })
  }, [client])
  return null
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
      <ToastProvider />
    </QueryClientProvider>
  )
}
