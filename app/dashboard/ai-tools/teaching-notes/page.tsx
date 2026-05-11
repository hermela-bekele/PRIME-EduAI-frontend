'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Loader, Download, Sparkles } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function TeachingNotesPage() {
  const [lessonPlan, setLessonPlan] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [includeMisconceptions, setIncludeMisconceptions] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!lessonPlan.trim()) {
      setError('Please enter your lesson plan')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/teaching-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonPlan,
          subject: subject || 'General',
          gradeLevel: gradeLevel || 'Not specified',
          includeCommonMisconceptions: includeMisconceptions,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate teaching notes')

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating teaching notes')
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
    link.download = `teaching-notes-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="rounded-2xl border bg-linear-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
          <Sparkles className="h-4 w-4" />
          AI Instruction Coach
        </div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mt-2">
          <BookOpen className="w-8 h-8" /> Teaching Notes Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate clear teaching notes with strategies, misconceptions, and classroom implementation tips.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">Instructional Strategies</Badge>
          <Badge variant="secondary">Misconceptions</Badge>
          <Badge variant="secondary">Questioning Prompts</Badge>
        </div>
      </div>

      {!result ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create Teaching Notes</CardTitle>
            <CardDescription>
              Get detailed notes to help you teach your lesson effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  type="text"
                  placeholder="e.g., Mathematics"
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
              <label className="text-sm font-medium">Include Common Misconceptions</label>
              <div className="mt-2 flex items-center gap-2 rounded-md border bg-muted/40 p-3">
                <input
                  type="checkbox"
                  id="misconceptions"
                  checked={includeMisconceptions}
                  onChange={(e) => setIncludeMisconceptions(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="misconceptions" className="text-sm">
                  Generate strategies for addressing common student misconceptions
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Lesson Plan *</label>
              <Textarea
                placeholder="Paste your lesson plan or lesson outline here..."
                className="mt-1 h-64"
                value={lessonPlan}
                onChange={(e) => setLessonPlan(e.target.value)}
              />
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
                'Generate Teaching Notes'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-2xl font-bold">Teaching Notes</h2>
            <div className="flex gap-2">
              <Button onClick={() => setResult(null)} variant="outline">
                Create New
              </Button>
              <Button onClick={downloadJSON} className="gap-2">
                <Download className="w-4 h-4" /> Download
              </Button>
            </div>
          </div>

          {typeof result.teachingNotes === 'string' ? (
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm whitespace-pre-wrap">
                  {result.teachingNotes}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(result.teachingNotes, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
