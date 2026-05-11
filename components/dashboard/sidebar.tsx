'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  PlusCircle,
  Users,
  TrendingUp,
  Folder,
  Sparkles,
  School,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { normalizeRole, roleLabel, type AppRole } from '@/lib/roles'

function getMenuItems(role: AppRole) {
  if (role === 'department_head') {
    return [
      { href: '/dashboard', icon: BookOpen, label: 'Overview', exact: true },
      { href: '/dashboard/progress', icon: Users, label: 'Teacher Progress' },
      { href: '/dashboard/lessons', icon: FileText, label: 'Reviews' },
      { href: '/dashboard/assessments', icon: BarChart3, label: 'Reports' },
    ]
  }

  if (role === 'school') {
    return [
      { href: '/dashboard', icon: School, label: 'Dashboard', exact: true },
      { href: '/dashboard/assessments', icon: FileText, label: 'Department Reports' },
      { href: '/dashboard/progress', icon: BarChart3, label: 'Analytics' },
    ]
  }

  if (role === 'admin') {
    return [
      { href: '/dashboard', icon: Calendar, label: 'Calendars', exact: true },
    ]
  }

  return [
    { href: '/dashboard', icon: BookOpen, label: 'Dashboard', exact: true },
    { href: '/dashboard/classes', icon: Users, label: 'Classes' },
    { href: '/dashboard/lessons', icon: FileText, label: 'Lessons' },
    { href: '/dashboard/assessments', icon: BarChart3, label: 'Assessments' },
    { href: '/dashboard/progress', icon: TrendingUp, label: 'Progress' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/dashboard/files', icon: Folder, label: 'Resources' },
    { href: '/dashboard/ai-tools', icon: Sparkles, label: 'AI Tools' },
  ]
}

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname()
  const currentRole = normalizeRole(role)
  const menuItems = getMenuItems(currentRole)

  return (
    <aside className="w-72 h-screen shrink-0 bg-white/90 border-r border-slate-200/80 flex flex-col backdrop-blur-sm overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/80">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">PRIME</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="scrollbar-hide flex-1 min-h-0 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {roleLabel(currentRole)}
        </p>
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-4 px-3">Main</p>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive =
              item.exact ? pathname === item.href : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-4 px-3 mt-8">
          Quick Actions
        </p>
        <Button className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 mb-3 shadow-sm">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Lesson
        </Button>
        <Button variant="outline" className="w-full h-10 rounded-xl border-slate-200">
          <PlusCircle className="w-4 h-4 mr-2" />
          Generate Assessment
        </Button>
      </nav>

      <div className="p-4 border-t border-slate-200/80 space-y-2">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            pathname === '/dashboard/settings'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
              : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
