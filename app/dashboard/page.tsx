'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Calendar,
  Sparkles,
  School,
  ShieldCheck,
  AlertCircle,
  Clock3,
  Building2,
  Download,
  GraduationCap,
} from 'lucide-react'
import Link from 'next/link'
import { normalizeRole, roleLabel, type AppRole } from '@/lib/roles'

interface Stats {
  classes: number
  students: number
  lessons: number
  assessments: number
}

interface Lesson {
  id: string
  title: string
  class_id: string
  lesson_date: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    classes: 0,
    students: 0,
    lessons: 0,
    assessments: 0,
  })
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([])
  const [role, setRole] = useState<AppRole>('teacher')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient()
        setError(null)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          setRole(
            normalizeRole((profileData as { role?: string } | null)?.role || user.user_metadata?.role),
          )
        }

        // Fetch all data from our API routes
        const [classesRes, lessonsRes, studentsRes, assessmentsRes] = await Promise.all([
          fetch('/api/classes').catch(err => {
            console.error('[v0] Classes fetch error:', err)
            throw err
          }),
          fetch('/api/lessons').catch(err => {
            console.error('[v0] Lessons fetch error:', err)
            throw err
          }),
          fetch('/api/students').catch(err => {
            console.error('[v0] Students fetch error:', err)
            throw err
          }),
          fetch('/api/assessments').catch(err => {
            console.error('[v0] Assessments fetch error:', err)
            throw err
          }),
        ])

        if (!classesRes.ok || !lessonsRes.ok || !studentsRes.ok || !assessmentsRes.ok) {
          console.error('[v0] API Response errors:', {
            classes: classesRes.status,
            lessons: lessonsRes.status,
            students: studentsRes.status,
            assessments: assessmentsRes.status,
          })
          throw new Error('Failed to fetch dashboard data')
        }

        const classesData = await classesRes.json().catch((e: any) => {
          console.error('[v0] Failed to parse classes JSON:', e)
          return []
        })
        const lessonsData = await lessonsRes.json().catch((e: any) => {
          console.error('[v0] Failed to parse lessons JSON:', e)
          return []
        })
        const studentsData = await studentsRes.json().catch((e: any) => {
          console.error('[v0] Failed to parse students JSON:', e)
          return []
        })
        const assessmentsData = await assessmentsRes.json().catch((e: any) => {
          console.error('[v0] Failed to parse assessments JSON:', e)
          return []
        })

        setStats({
          classes: classesData.length,
          students: studentsData.length,
          lessons: lessonsData.length,
          assessments: assessmentsData.length,
        })

        // Show 5 most recent lessons
        setRecentLessons(lessonsData.slice(0, 5))
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const roleViewConfig = {
    teacher: {
      title: 'Welcome to PRIME Teaching',
      subtitle: 'Your AI-powered platform for intelligent lesson planning and student assessment',
      cards: ['Classes', 'Students', 'Lessons', 'Assessments'],
      primaryAction: { href: '/dashboard/classes', label: 'Manage Classes', tone: 'text-blue-600' },
      secondaryAction: { href: '/dashboard/lessons', label: 'Create Lessons', tone: 'text-green-600' },
      tertiaryAction: {
        href: '/dashboard/assessments',
        label: 'Create Assessments',
        tone: 'text-orange-600',
      },
    },
    department_head: {
      title: 'Department Head Workspace',
      subtitle: 'Monitor teacher progress, review instructional quality, and plan department improvements.',
      cards: ['Teachers', 'Department Students', 'Reviewed Lessons', 'Shared Assessments'],
      primaryAction: {
        href: '/dashboard/progress',
        label: 'Review Teacher Progress',
        tone: 'text-indigo-600',
      },
      secondaryAction: { href: '/dashboard/lessons', label: 'Review Lessons', tone: 'text-violet-600' },
      tertiaryAction: { href: '/dashboard/calendar', label: 'Plan Department Calendar', tone: 'text-sky-600' },
    },
    school: {
      title: 'School Leadership Dashboard',
      subtitle: 'Track school-wide performance, academic planning, and department alignment.',
      cards: ['Departments', 'School Students', 'Academic Plans', 'Evaluation Reports'],
      primaryAction: { href: '/dashboard/progress', label: 'View School Analytics', tone: 'text-cyan-600' },
      secondaryAction: { href: '/dashboard/calendar', label: 'Manage Academic Calendar', tone: 'text-teal-600' },
      tertiaryAction: { href: '/dashboard/files', label: 'Open School Resources', tone: 'text-emerald-600' },
    },
    admin: {
      title: 'Platform Admin Console',
      subtitle: 'Oversee institutions, platform usage, and system-level operations.',
      cards: ['Institutions', 'Active Users', 'Operational Workflows', 'System Reviews'],
      primaryAction: { href: '/dashboard/settings', label: 'Platform Settings', tone: 'text-rose-600' },
      secondaryAction: {
        href: '/dashboard/classes',
        label: 'Manage Institutions',
        tone: 'text-fuchsia-600',
      },
      tertiaryAction: {
        href: '/dashboard/assessments',
        label: 'System Monitoring',
        tone: 'text-pink-600',
      },
    },
  }[role]

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    )
  }

  if (role === 'department_head') {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-700">Department Head</p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Mathematics Department</h1>
          <p className="text-sm text-slate-600">
            Monitor teacher progress, review AI-generated lesson plans, and support your team.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teachers</p><p className="mt-2 text-4xl font-semibold text-slate-900">{stats.classes}</p></Card>
          <Card className="border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg completion</p><p className="mt-2 text-4xl font-semibold text-slate-900">{Math.min(100, stats.lessons * 7)}%</p></Card>
          <Card className="border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue sessions</p><p className="mt-2 text-4xl font-semibold text-slate-900">{Math.max(0, stats.assessments - 1)}</p></Card>
          <Card className="border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending reviews</p><p className="mt-2 text-4xl font-semibold text-slate-900">{Math.max(0, stats.lessons - 1)}</p></Card>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Teachers</Button>
          <Button size="sm" variant="outline">Overdue</Button>
          <Button size="sm" variant="outline">Pending Reviews</Button>
        </div>

        <div className="max-w-md">
          <input
            placeholder="Filter by teacher name..."
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          />
        </div>

        <Card>
          <div className="p-6 text-sm text-slate-600">No teacher records found for the selected filter.</div>
        </Card>
      </div>
    )
  }

  if (role === 'school') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-blue-700">School Leader</p>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">Addis Prep Academy</h1>
            <p className="text-sm text-slate-600">School-wide teaching health across all departments and grades.</p>
          </div>
          <Button type="button" variant="outline" className="h-10 gap-2 self-start lg:self-auto">
            <Download className="h-4 w-4" />
            Download report
          </Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teachers</p><p className="mt-2 text-4xl font-semibold text-slate-900">{Math.max(12, stats.students)}</p></Card>
          <Card className="border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Departments</p><p className="mt-2 text-4xl font-semibold text-slate-900">{Math.max(4, stats.classes)}</p></Card>
          <Card className="border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg completion</p><p className="mt-2 text-4xl font-semibold text-slate-900">{Math.min(100, 40 + stats.lessons)}%</p></Card>
          <Card className="border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sessions / month</p><p className="mt-2 text-4xl font-semibold text-slate-900">{Math.max(120, stats.lessons * 12)}</p></Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-4xl font-semibold text-slate-900">Department comparison</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {['Mathematics', 'Sciences', 'Languages', 'Humanities'].map((department, i) => {
              const completion = [75, 64, 50, 33][i]
              return (
                <Card key={department} className="border-slate-200 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-2xl font-semibold text-slate-900">{department}</p>
                      <p className="text-xs text-slate-500">{6 - i} teachers · {12 - i} sessions</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{completion}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${completion}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Delivered: <strong>{Math.round((completion / 100) * (12 - i))}</strong></span>
                    <span>Pending: <strong>{(12 - i) - Math.round((completion / 100) * (12 - i))}</strong></span>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-4xl font-semibold text-slate-900">Completion rate over time</h3>
            <p className="text-sm text-slate-500">Last 8 weeks, school-wide.</p>
            <div className="mt-4 h-40 rounded-lg border border-dashed border-slate-200 bg-slate-50/60" />
          </div>
        </Card>
      </div>
    )
  }

  if (role === 'admin') {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Generate a calendar</h1>
          <p className="text-sm text-slate-600">PRIME builds a session-by-session teaching plan from your curriculum and constraints.</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>1 Subject</span><span>2 Sequencing</span><span>3 Schedule</span><span>4 Review</span>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Subject</label>
              <input className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3" defaultValue="Mathematics - Grade 11" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Stream</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">Natural Science</Button>
                <Button variant="outline">Social Science</Button>
                <Button variant="outline">Core</Button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost">Back</Button>
              <Button>Continue</Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{roleViewConfig.title}</h1>
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {roleLabel(role)}
          </span>
        </div>
        <p className="text-gray-600">{roleViewConfig.subtitle}</p>
      </div>

      {isLoading && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <div className="p-4">
            <p className="text-blue-700 font-medium">Loading dashboard...</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <div className="p-4">
            <p className="text-red-700 font-medium">Error loading dashboard</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </Card>
      )}

      {!error && (
        <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-slate-200/80 shadow-sm bg-white/95 hover:shadow-md transition rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">{roleViewConfig.cards[0]}</p>
              <p className="text-4xl font-bold text-gray-900">{stats.classes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200/80 shadow-sm bg-white/95 hover:shadow-md transition rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">{roleViewConfig.cards[1]}</p>
              <p className="text-4xl font-bold text-gray-900">{stats.students}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200/80 shadow-sm bg-white/95 hover:shadow-md transition rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">{roleViewConfig.cards[2]}</p>
              <p className="text-4xl font-bold text-gray-900">{stats.lessons}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200/80 shadow-sm bg-white/95 hover:shadow-md transition rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">{roleViewConfig.cards[3]}</p>
              <p className="text-4xl font-bold text-gray-900">{stats.assessments}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href={roleViewConfig.primaryAction.href}>
          <Card className="p-6 border-slate-200/80 shadow-sm bg-white/95 hover:shadow-md transition cursor-pointer h-full rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {role === 'teacher' ? (
                  <Users className="w-5 h-5 text-blue-600" />
                ) : role === 'school' ? (
                  <School className="w-5 h-5 text-blue-600" />
                ) : role === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{roleViewConfig.primaryAction.label}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Open key workflows for your current role.</p>
            <div className={`flex items-center text-sm font-medium ${roleViewConfig.primaryAction.tone}`}>
              Open <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Card>
        </Link>

        <Link href={roleViewConfig.secondaryAction.href}>
          <Card className="p-6 border-slate-200/80 shadow-sm bg-white/95 hover:shadow-md transition cursor-pointer h-full rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                {role === 'admin' ? (
                  <Users className="w-5 h-5 text-green-600" />
                ) : (
                  <BookOpen className="w-5 h-5 text-green-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{roleViewConfig.secondaryAction.label}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Track and operate the activities that matter most.</p>
            <div className={`flex items-center text-sm font-medium ${roleViewConfig.secondaryAction.tone}`}>
              Open <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Card>
        </Link>

        <Link href={roleViewConfig.tertiaryAction.href}>
          <Card className="p-6 border-slate-200/80 shadow-sm bg-white/95 hover:shadow-md transition cursor-pointer h-full rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                {role === 'school' ? (
                  <Calendar className="w-5 h-5 text-orange-600" />
                ) : (
                  <ClipboardList className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{roleViewConfig.tertiaryAction.label}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Access role-specific tools and strategic actions.</p>
            <div className={`flex items-center text-sm font-medium ${roleViewConfig.tertiaryAction.tone}`}>
              Open <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/ai-tools">
          <Card className="p-6 border-2 border-indigo-200 shadow-sm hover:shadow-md transition cursor-pointer h-full rounded-2xl" style={{ background: 'linear-gradient(to bottom right, rgb(239, 246, 255), rgb(224, 242, 254))' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Tools</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Generate lesson plans, teaching notes & curriculum</p>
            <div className="flex items-center text-indigo-600 text-sm font-medium">
              Explore AI Tools <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Lessons */}
      <Card className="border-slate-200/80 shadow-sm bg-white/95 rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Recent Lessons
          </h2>
        </div>
        <div className="p-6">
          {recentLessons.length === 0 ? (
            <p className="text-gray-600">No lessons yet. Start by creating your first lesson!</p>
          ) : (
            <div className="space-y-3">
              {recentLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{lesson.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(lesson.lesson_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/lessons/${lesson.id}`}>
                    <Button variant="ghost" size="sm">
                      View <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
        </>
      )}
    </div>
  )
}
