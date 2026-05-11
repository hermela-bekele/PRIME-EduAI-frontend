'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Plus, Trash2, ExternalLink, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  class_id: string
  status: string
  created_at: string
  lesson_date: string
  duration_minutes: number
  objective: string
  description: string
}

interface Class {
  id: string
  name: string
  subject: string
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    class_id: '',
    duration_minutes: 45,
    status: 'draft',
    lesson_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [classesRes, lessonsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/lessons'),
      ])

      if (!classesRes.ok || !lessonsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const classesData = await classesRes.json()
      const lessonsData = await lessonsRes.json()

      setClasses(classesData)
      setLessons(lessonsData)

      if (classesData.length > 0 && !formData.class_id) {
        setFormData((prev) => ({ ...prev, class_id: classesData[0].id }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.class_id) {
        setError('Please select a class')
        return
      }

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create lesson')

      const newLesson = await response.json()
      setLessons([newLesson, ...lessons])
      setFormData({
        title: '',
        description: '',
        objective: '',
        class_id: classes[0]?.id || '',
        duration_minutes: 45,
        status: 'draft',
        lesson_date: new Date().toISOString().split('T')[0],
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating lesson')
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson? This action cannot be undone.')) return
    try {
      const response = await fetch(`/api/lessons/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete lesson')
      setLessons(lessons.filter((l) => l.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting lesson')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLessons = filterStatus === 'all' ? lessons : lessons.filter((l) => l.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading lessons...</p>
      </div>
    )
  }

  const getClassName = (classId: string) => {
    return classes.find((c) => c.id === classId)?.name || 'Unknown Class'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lessons</h1>
          <p className="text-gray-600 mt-1">Create and manage your lesson plans</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Lesson
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
            <CardTitle>Create New Lesson</CardTitle>
            <CardDescription>Plan a new lesson for your class</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Quadratic Equations"
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
                <label className="text-sm font-medium">Learning Objective</label>
                <textarea
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What students will learn and be able to do"
                  rows={3}
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lesson_date}
                    onChange={(e) => setFormData({ ...formData, lesson_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 45 })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="planned">Planned</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Lesson</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 border-b">
        {['all', 'draft', 'planned', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 border-b-2 transition capitalize ${
              filterStatus === status
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all' ? 'No lessons yet. Create your first lesson to get started!' : `No ${filterStatus} lessons`}
            </p>
            {filterStatus === 'all' && <Button onClick={() => setShowForm(true)}>Create Lesson</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{lesson.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusBadgeColor(lesson.status)}`}>
                        {lesson.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{getClassName(lesson.class_id)}</p>
                    {lesson.objective && (
                      <p className="text-sm text-gray-700 mb-3 italic">{lesson.objective}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      {lesson.lesson_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(lesson.lesson_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lesson.duration_minutes} min
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/lessons/${lesson.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ExternalLink className="w-4 h-4" /> View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.id)}
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
