'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Check, Upload, Plus, Grid3X3, Loader2 } from 'lucide-react'
import { normalizeRole, type AppRole } from '@/lib/roles'

interface GeneratedSession {
  session_number: number
  title: string
  learning_objectives: string[] | string
  topics: string[] | string
  duration_hours: number
  resources_needed: string[] | string
  assessment_points: string[] | string
  prerequisites: string[] | string
}

interface ScheduledSession extends GeneratedSession {
  scheduled_date: string
}

export default function CalendarPage() {
  const supabase = createClient()
  const [role, setRole] = useState<AppRole>('teacher')
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)

  const [uploadedFileName, setUploadedFileName] = useState('')
  const [supplementalUrl, setSupplementalUrl] = useState('')
  const [supplementalUrls, setSupplementalUrls] = useState<string[]>([])
  const [textbookContent, setTextbookContent] = useState('')
  const [sequenceMode, setSequenceMode] = useState<'textbook' | 'ai'>('ai')
  const [academicYear, setAcademicYear] = useState('')
  const [totalSessions, setTotalSessions] = useState('120')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressNote, setProgressNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setRole(normalizeRole((profileData as { role?: string } | null)?.role || user.user_metadata?.role))
        }
      } catch (err) {
        console.error('Error loading role:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFileName(file.name)
  }

  const addSupplementalUrl = () => {
    const clean = supplementalUrl.trim()
    if (!clean) return
    setSupplementalUrls((prev) => [...prev, clean])
    setSupplementalUrl('')
  }

  const getInstructionalDates = (start: string, end: string, targetCount: number) => {
    const dates: string[] = []
    const cursor = new Date(start)
    const endDateObj = new Date(end)

    while (cursor <= endDateObj && dates.length < targetCount) {
      const day = cursor.getDay()
      const isWeekday = day !== 0 && day !== 6
      if (isWeekday) dates.push(cursor.toISOString().split('T')[0])
      cursor.setDate(cursor.getDate() + 1)
    }

    return dates
  }

  const scheduleSessions = (sessions: GeneratedSession[], start: string, end: string, desiredCount: number) => {
    const dates = getInstructionalDates(start, end, desiredCount)
    return sessions.slice(0, dates.length).map((session, idx) => ({
      ...session,
      scheduled_date: dates[idx],
    }))
  }

  const handleGenerateCalendar = async () => {
    if (!textbookContent.trim()) {
      setError('Please paste textbook content to generate the calendar.')
      return
    }
    if (!academicYear.trim() || !startDate || !endDate || !totalSessions) {
      setError('Please complete academic year, sessions, start date, and end date.')
      return
    }

    setError(null)
    setIsGenerating(true)
    setStep(4)
    setProgress(15)
    setProgressNote(`Building session plan for textbook within ${totalSessions} sessions...`)

    const timer = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + 12, 92))
    }, 400)

    try {
      const payloadContent = [
        textbookContent,
        supplementalUrls.length > 0 ? `Supplemental resources:\n${supplementalUrls.join('\n')}` : '',
        `Sequence mode: ${sequenceMode === 'ai' ? 'AI-optimized sequence' : 'Textbook order'}`,
      ]
        .filter(Boolean)
        .join('\n\n')

      const response = await fetch('/api/ai/curriculum-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textbookContent: payloadContent,
          learningDays: Number(totalSessions),
          subject: 'General',
          gradeLevel: academicYear,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to generate calendar')

      const rawSessions: GeneratedSession[] = Array.isArray(data.sessions) ? data.sessions : []
      const planned = scheduleSessions(rawSessions, startDate, endDate, Number(totalSessions))
      setScheduledSessions(planned)
      setProgress(100)
      setProgressNote(`Generated ${planned.length} sessions for ${academicYear}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate calendar')
    } finally {
      window.clearInterval(timer)
      setIsGenerating(false)
    }
  }

  const stepTitles = ['Upload textbook', 'Choose sequence', 'Configure', 'Generate']

  const groupedByMonth = scheduledSessions.reduce<Record<string, ScheduledSession[]>>((acc, session) => {
    const key = new Date(session.scheduled_date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    acc[key] = acc[key] || []
    acc[key].push(session)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading calendar...</p>
      </div>
    )
  }

  if (role !== 'teacher') {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-gray-600">This guided calendar generator is available for teacher accounts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Upload Content</h1>
        <p className="text-gray-600 mt-2">Upload your textbook and configure the teaching sequence</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stepTitles.map((title, idx) => {
          const stepNo = idx + 1
          const done = step > stepNo
          const active = step === stepNo
          return (
            <div key={title} className="flex flex-col items-center gap-2">
              <div
                className={`h-10 w-10 rounded-full border flex items-center justify-center font-semibold ${
                  done
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : active
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-gray-200 text-gray-400'
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : stepNo}
              </div>
              <p className={`text-sm ${active ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>{title}</p>
            </div>
          )
        })}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload your textbook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-200 p-8 text-center hover:bg-gray-50">
              <input type="file" className="hidden" accept=".pdf,.txt,.doc,.docx,.md" onChange={handleUploadFile} />
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-xl font-semibold text-slate-900">Drop PDF here or click to upload</p>
              <p className="text-gray-500 mt-2">{uploadedFileName || 'Ethiopian Grade 11 Mathematics textbook'}</p>
            </label>

            <div>
              <label className="text-sm font-medium">Textbook content (required for AI)</label>
              <Textarea
                value={textbookContent}
                onChange={(e) => setTextbookContent(e.target.value)}
                className="mt-2 h-40"
                placeholder="Paste the textbook/curriculum text that AI should break into sessions..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Supplemental resources (optional)</label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={supplementalUrl}
                  onChange={(e) => setSupplementalUrl(e.target.value)}
                  placeholder="Paste YouTube or resource URL..."
                />
                <Button type="button" variant="outline" onClick={addSupplementalUrl} className="gap-2">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              {supplementalUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {supplementalUrls.map((url) => (
                    <Badge key={url} variant="secondary">{url}</Badge>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(2)}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose sequencing mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => setSequenceMode('textbook')}
              className={`w-full rounded-xl border p-5 text-left ${sequenceMode === 'textbook' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
            >
              <p className="text-2xl font-semibold text-slate-900">Textbook order</p>
              <p className="text-gray-600 mt-1">
                Follow the exact sequence of the uploaded textbook. Best for strict curriculum alignment.
              </p>
            </button>
            <button
              onClick={() => setSequenceMode('ai')}
              className={`w-full rounded-xl border p-5 text-left ${sequenceMode === 'ai' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-slate-900">AI-optimized sequence</p>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Recommended</Badge>
              </div>
              <p className="text-gray-600 mt-1">
                Rearrange topics for better conceptual flow and stronger progression.
              </p>
            </button>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(3)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure academic year</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Academic year</label>
              <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="e.g. 2024/2025" className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Total teaching sessions</label>
              <Input value={totalSessions} onChange={(e) => setTotalSessions(e.target.value)} placeholder="e.g. 120" type="number" className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Start date</label>
              <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">End date</label>
              <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="mt-2" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={handleGenerateCalendar}>
                <Grid3X3 className="h-4 w-4" /> Generate calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="mx-auto h-24 w-24 rounded-3xl bg-emerald-100 flex items-center justify-center">
              {isGenerating ? <Loader2 className="h-10 w-10 text-emerald-700 animate-spin" /> : <Grid3X3 className="h-10 w-10 text-emerald-700" />}
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-slate-900">Generating your calendar</h2>
              <p className="text-gray-600 mt-2">AI is building your full-year session plan.</p>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-gray-600">{progressNote}</p>

            {!isGenerating && scheduledSessions.length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-slate-900">Session breakdown calendar</h3>
                  <Button variant="outline" onClick={() => {
                    setStep(1)
                    setScheduledSessions([])
                    setProgress(0)
                  }}>
                    Create new
                  </Button>
                </div>

                {Object.entries(groupedByMonth).map(([month, sessions]) => (
                  <Card key={month} className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-xl">{month}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sessions.map((session) => (
                        <div key={`${month}-${session.session_number}`} className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900">
                              Session {session.session_number}: {session.title}
                            </p>
                            <span className="text-xs text-gray-600">
                              {new Date(session.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {Array.isArray(session.topics) ? session.topics.slice(0, 2).join(', ') : session.topics}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
