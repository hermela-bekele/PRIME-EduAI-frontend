'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus, ChevronLeft, Trash2 } from 'lucide-react'

interface Class {
  id: string
  name: string
  description: string
  subject: string
  grade_level: string
  color: string
}

interface Student {
  id: string
  name: string
  email: string
  enrollment_date: string
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [classData, setClassData] = useState<Class | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })

  useEffect(() => {
    fetchClassAndStudents()
  }, [classId])

  const fetchClassAndStudents = async () => {
    try {
      setLoading(true)
      const classRes = await fetch(`/api/classes`)
      const classesData = await classRes.json()
      const foundClass = classesData.find((c: Class) => c.id === classId)
      setClassData(foundClass)

      const studentsRes = await fetch(`/api/students?classId=${classId}`)
      const studentsData = await studentsRes.json()
      setStudents(studentsData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          name: formData.name,
          email: formData.email,
        }),
      })
      if (!response.ok) throw new Error('Failed to add student')
      const newStudent = await response.json()
      setStudents([...students, newStudent])
      setFormData({ name: '', email: '' })
      setShowForm(false)
    } catch (err) {
      console.error('Error adding student:', err)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Remove this student from the class?')) return
    try {
      await fetch(`/api/students/${studentId}`, { method: 'DELETE' })
      setStudents(students.filter((s) => s.id !== studentId))
    } catch (err) {
      console.error('Error deleting student:', err)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Classes
      </button>

      {classData && (
        <div className="flex items-center gap-6 mb-6">
          <div
            className="w-20 h-20 rounded-lg"
            style={{ backgroundColor: classData.color }}
          />
          <div>
            <h1 className="text-3xl font-bold">{classData.name}</h1>
            <p className="text-gray-600">{classData.subject} • Grade {classData.grade_level}</p>
            <p className="text-gray-500 mt-2">{classData.description}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lessons Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Roster</CardTitle>
              <CardDescription>Manage students in this class</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleAddStudent} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <label className="text-sm font-medium">Student Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Student</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {students.length === 0 ? (
              <div className="py-8 text-center text-gray-600">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p>No students yet. Add your first student to get started.</p>
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
