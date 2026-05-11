'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Plus, Trash2, Edit2, Calendar } from 'lucide-react'

interface Assessment {
  id: string
  class_id: string
  title: string
  description: string
  assessment_type: string
  total_points: number
  due_date: string
  created_at: string
}

interface Class {
  id: string
  name: string
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assessment_type: 'quiz',
    class_id: '',
    total_points: 100,
    due_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [classesRes, assessmentsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/assessments'),
      ])

      if (!classesRes.ok || !assessmentsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const classesData = await classesRes.json()
      const assessmentsData = await assessmentsRes.json()

      setClasses(classesData)
      setAssessments(assessmentsData)

      if (classesData.length > 0 && !formData.class_id) {
        setFormData((prev) => ({ ...prev, class_id: classesData[0].id }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.class_id) {
        setError('Please select a class')
        return
      }

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create assessment')

      const newAssessment = await response.json()
      setAssessments([newAssessment, ...assessments])
      setFormData({
        title: '',
        description: '',
        assessment_type: 'quiz',
        class_id: classes[0]?.id || '',
        total_points: 100,
        due_date: new Date().toISOString().split('T')[0],
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating assessment')
    }
  }

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Delete this assessment?')) return
    try {
      const response = await fetch(`/api/assessments/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete assessment')
      setAssessments(assessments.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting assessment')
    }
  }

  const getClassName = (classId: string) => {
    return classes.find((c) => c.id === classId)?.name || 'Unknown Class'
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-blue-100 text-blue-800'
      case 'assignment':
        return 'bg-purple-100 text-purple-800'
      case 'test':
        return 'bg-red-100 text-red-800'
      case 'project':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAssessments = filterType === 'all' ? assessments : assessments.filter((a) => a.assessment_type === filterType)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading assessments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
          <p className="text-gray-600 mt-1">Create quizzes, tests, and assignments for your students</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Assessment
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Assessment</CardTitle>
            <CardDescription>Add a quiz, test, assignment, or project</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Quadratic Equations Quiz"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Class *</label>
                  <select
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this assessment about?"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <select
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.assessment_type}
                    onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="test">Test</option>
                    <option value="project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Points</label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.total_points}
                    onChange={(e) => setFormData({ ...formData, total_points: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Assessment</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 border-b">
        {['all', 'quiz', 'assignment', 'test', 'project'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 border-b-2 transition capitalize ${
              filterType === type
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {filterType === 'all' ? 'No assessments yet.' : `No ${filterType}s yet.`}
            </p>
            {filterType === 'all' && <Button onClick={() => setShowForm(true)}>Create Assessment</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{assessment.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getTypeBadgeColor(assessment.assessment_type)}`}>
                        {assessment.assessment_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{getClassName(assessment.class_id)}</p>
                    {assessment.description && (
                      <p className="text-sm text-gray-700 mb-3">{assessment.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Total Points: {assessment.total_points}</span>
                      {assessment.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: {new Date(assessment.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Edit2 className="w-4 h-4" /> Grade
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
