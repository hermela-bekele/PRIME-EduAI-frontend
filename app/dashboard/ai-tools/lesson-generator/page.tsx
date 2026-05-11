'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Loader, Download, Sparkles, Clock3 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function LessonGeneratorPage() {
  const [resources, setResources] = useState('')
  const [objectives, setObjectives] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [duration, setDuration] = useState('45')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!resources.trim()) {
      setError('Please enter available resources')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resources,
          learningObjectives: objectives,
          subject: subject || 'General',
          gradeLevel: gradeLevel || 'Not specified',
          duration: duration || '45',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate lesson plan')

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating lesson plan')
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
    link.download = `lesson-plan-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="rounded-2xl border bg-linear-to-r from-emerald-500/10 via-lime-500/10 to-green-500/10 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <Sparkles className="h-4 w-4" />
          AI Lesson Planning Assistant
        </div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mt-2">
          <Zap className="w-8 h-8" /> Lesson Plan Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Build complete, classroom-ready lesson plans from your objectives and available resources.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">Lesson Flow</Badge>
          <Badge variant="secondary">Assessment Ideas</Badge>
          <Badge variant="secondary">Differentiation</Badge>
        </div>
      </div>

      {!result ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Generate Your Lesson Plan</CardTitle>
            <CardDescription>
              Provide your resources and learning objectives, and AI will create a detailed lesson plan
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
              <label className="text-sm font-medium">Duration (minutes)</label>
              <div className="relative mt-1">
                <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  min="5"
                  max="480"
                  placeholder="45"
                  className="pl-9"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Learning Objectives</label>
              <Textarea
                placeholder="List the main learning objectives or outcomes students should achieve..."
                className="mt-1 h-32"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Available Resources *</label>
              <Textarea
                placeholder="Describe available teaching resources, materials, textbooks, technology, etc..."
                className="mt-1 h-40"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
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
                'Generate Lesson Plan'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-2xl font-bold">Generated Lesson Plan</h2>
            <div className="flex gap-2">
              <Button onClick={() => setResult(null)} variant="outline">
                Create New
              </Button>
              <Button onClick={downloadJSON} className="gap-2">
                <Download className="w-4 h-4" /> Download
              </Button>
            </div>
          </div>

          {typeof result.lessonPlan === 'string' ? (
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm whitespace-pre-wrap">
                  {result.lessonPlan}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(result.lessonPlan, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
