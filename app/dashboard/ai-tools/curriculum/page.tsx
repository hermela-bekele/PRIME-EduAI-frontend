'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookMarked, Loader, Download, Sparkles, CalendarDays } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Session {
  session_number: number
  title: string
  learning_objectives: string[]
  topics: string[]
  duration_hours: number
  resources_needed: string[]
  assessment_points: string[]
  prerequisites: string[]
}

export default function CurriculumBreakdownPage() {
  const [content, setContent] = useState('')
  const [learningDays, setLearningDays] = useState('10')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please enter textbook or curriculum content')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/curriculum-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textbookContent: content,
          learningDays: parseInt(learningDays),
          subject: subject || 'General',
          gradeLevel: gradeLevel || 'Not specified',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate curriculum breakdown')
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating curriculum breakdown')
    } finally {
      setLoading(false)
    }
  }

  const downloadJSON = () => {
    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `curriculum-breakdown-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="rounded-2xl border bg-linear-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
          <Sparkles className="h-4 w-4" />
          AI Curriculum Designer
        </div>
        <h1 className="mt-2 text-3xl font-bold text-foreground flex items-center gap-2">
          <BookMarked className="w-8 h-8" /> Curriculum Breakdown
        </h1>
        <p className="text-muted-foreground mt-2">
          Turn long textbook content into structured, session-by-session learning plans your learners can follow.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">Learning Objectives</Badge>
          <Badge variant="secondary">Time Allocation</Badge>
          <Badge variant="secondary">Assessment Points</Badge>
        </div>
      </div>

      {!result ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Organize Your Curriculum</CardTitle>
            <CardDescription>
              Paste your textbook content or curriculum outline and let AI organize it into structured learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  type="text"
                  placeholder="e.g., Mathematics, Biology"
                  className="mt-1"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Grade Level</label>
                <Input
                  type="text"
                  placeholder="e.g., Grade 11"
                  className="mt-1"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Number of Learning Days/Sessions</label>
              <div className="relative mt-1">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                type="number"
                min="1"
                max="100"
                placeholder="10"
                className="pl-9"
                value={learningDays}
                onChange={(e) => setLearningDays(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Textbook/Curriculum Content *</label>
              <Textarea
                placeholder="Paste your textbook content, chapter outline, or curriculum guide here..."
                className="mt-1 h-64"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Paste the full text or a detailed outline of the content you want to break down
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                'Generate Curriculum Breakdown'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-2xl font-bold">Generated Curriculum Breakdown</h2>
            <div className="flex gap-2">
              <Button onClick={() => setResult(null)} variant="outline">
                Create New
              </Button>
              <Button onClick={downloadJSON} className="gap-2">
                <Download className="w-4 h-4" /> Download JSON
              </Button>
            </div>
          </div>

          {typeof result.sessions === 'string' ? (
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm whitespace-pre-wrap">
                  {result.sessions}
                </pre>
              </CardContent>
            </Card>
          ) : Array.isArray(result.sessions) ? (
            <div className="space-y-4">
              {result.sessions.map((session: Session, idx: number) => (
                <Card key={idx} className="border-l-4 border-l-blue-500 shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Session {session.session_number}: {session.title}</CardTitle>
                        <CardDescription>{session.duration_hours} hours</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Learning Objectives</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {(Array.isArray(session.learning_objectives) ? session.learning_objectives : [session.learning_objectives]).map((obj: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">{obj}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Topics</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {(Array.isArray(session.topics) ? session.topics : [session.topics]).map((topic: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">{topic}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Resources Needed</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {(Array.isArray(session.resources_needed) ? session.resources_needed : [session.resources_needed]).map((res: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">{res}</li>
                        ))}
                      </ul>
                    </div>

                    {session.assessment_points && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Assessment Points</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {(Array.isArray(session.assessment_points) ? session.assessment_points : [session.assessment_points]).map((assess: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">{assess}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(result.sessions, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
