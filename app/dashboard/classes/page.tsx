'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Class {
  id: string
  name: string
  description: string
  subject: string
  grade_level: string
  color: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    grade_level: '',
    color: '#3b82f6',
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/classes')
      if (!response.ok) throw new Error('Failed to fetch classes')
      const data = await response.json()
      setClasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to create class')
      const newClass = await response.json()
      setClasses([newClass, ...classes])
      setFormData({
        name: '',
        description: '',
        subject: '',
        grade_level: '',
        color: '#3b82f6',
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    try {
      const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete class')
      setClasses(classes.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
          <p className="text-gray-600 mt-1">Manage your teaching classes and student rosters</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Class
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Class</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Class Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grade 11 Mathematics A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the class"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mathematics"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Grade Level</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 11"
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="mt-1 flex gap-3">
                  {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Class</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No classes yet. Create your first class to get started.</p>
            <Button onClick={() => setShowForm(true)}>Create Class</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/dashboard/classes/${cls.id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div
                        className="w-12 h-12 rounded-lg mb-3"
                        style={{ backgroundColor: cls.color }}
                      />
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>{cls.subject} • Grade {cls.grade_level}</CardDescription>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteClass(cls.id)
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{cls.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
