'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader, Download, Sparkles } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function TeacherDevelopmentPage() {
  const [trainingMaterials, setTrainingMaterials] = useState('')
  const [focusArea, setFocusArea] = useState('')
  const [teachingLevel, setTeachingLevel] = useState('')
  const [specificChallenges, setSpecificChallenges] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!trainingMaterials.trim()) {
      setError('Please enter training materials')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/teacher-development', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingMaterials,
          focusArea: focusArea || 'General Teaching Excellence',
          teachingLevel: teachingLevel || 'Not specified',
          specificChallenges: specificChallenges || 'None',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate development plan')

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating development plan')
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
    link.download = `teacher-development-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="rounded-2xl border bg-linear-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
          <Sparkles className="h-4 w-4" />
          AI Professional Growth Planner
        </div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mt-2">
          <GraduationCap className="w-8 h-8" /> Teacher Professional Development
        </h1>
        <p className="text-muted-foreground mt-2">
          Build a practical and personalized growth roadmap from your PD resources, challenges, and goals.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">Growth Goals</Badge>
          <Badge variant="secondary">Action Plan</Badge>
          <Badge variant="secondary">Student Impact</Badge>
        </div>
      </div>

      {!result ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Develop Your Teaching Practice</CardTitle>
            <CardDescription>
              Get a personalized professional development plan aligned with your training materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Teaching Level</label>
                <Input
                  type="text"
                  placeholder="e.g., Secondary, Primary"
                  className="mt-1"
                  value={teachingLevel}
                  onChange={(e) => setTeachingLevel(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Focus Area</label>
                <Input
                  type="text"
                  placeholder="e.g., Student Engagement, Assessment"
                  className="mt-1"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Specific Challenges (optional)</label>
              <Textarea
                placeholder="Describe any specific teaching challenges or areas you want to improve..."
                className="mt-1 h-24"
                value={specificChallenges}
                onChange={(e) => setSpecificChallenges(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Training Materials/Resources *</label>
              <Textarea
                placeholder="Paste training materials, workshop notes, educational articles, or any resources you've received..."
                className="mt-1 h-48"
                value={trainingMaterials}
                onChange={(e) => setTrainingMaterials(e.target.value)}
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
                'Create Development Plan'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-2xl font-bold">Your Development Plan</h2>
            <div className="flex gap-2">
              <Button onClick={() => setResult(null)} variant="outline">
                Create New
              </Button>
              <Button onClick={downloadJSON} className="gap-2">
                <Download className="w-4 h-4" /> Download
              </Button>
            </div>
          </div>

          {typeof result.developmentPlan === 'string' ? (
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm whitespace-pre-wrap">
                  {result.developmentPlan}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(result.developmentPlan, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
