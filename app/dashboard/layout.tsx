'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { normalizeRole } from '@/lib/roles'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
      } else {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        const resolvedRole = normalizeRole(
          (profileData as { role?: string } | null)?.role || user.user_metadata?.role,
        )

        setUser({
          ...user,
          role: resolvedRole,
          profile: profileData || null,
        })
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/70">
      <Sidebar role={user?.role} />
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Header user={user} role={user?.role} />
        <main className="scrollbar-hide flex-1 min-h-0 overflow-y-auto">
          <div className="page-shell">{children}</div>
        </main>
      </div>
    </div>
  )
}
