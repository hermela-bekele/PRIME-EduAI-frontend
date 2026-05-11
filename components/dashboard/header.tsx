'use client'

import { useEffect, useState } from 'react'
import { Search, Bell, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { normalizeRole, roleLabel } from '@/lib/roles'

export function Header({ user, role }: { user: any; role?: string }) {
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()
  const currentRole = normalizeRole(role || user?.role)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
        }
      }
    }

    fetchProfile()
  }, [user, supabase])

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
      user?.email?.split('@')[0]
    : user?.email?.split('@')[0]

  return (
    <header className="border-b border-slate-200/80 bg-white/85 px-6 py-4 backdrop-blur-sm lg:px-8 flex items-center justify-between">
      <div className="flex items-center flex-1 gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search lessons, classes..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-10 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {roleLabel(currentRole)}
        </Badge>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-indigo-100 hover:bg-indigo-200">
              <User className="w-5 h-5 text-indigo-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="text-sm">
              <span className="font-semibold">{displayName}</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-xs text-gray-500">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings">Profile Settings</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/auth/logout">Sign Out</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
