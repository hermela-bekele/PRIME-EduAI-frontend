'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ArrowLeft, FileText, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<any>(null)
  const [resources, setResources] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    content: '',
    duration_minutes: 45,
    lesson_date: '',
    lesson_time: '',
    status: 'draft',
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single()

        if (lessonData) {
          setLesson(lessonData)
          setFormData({
            title: lessonData.title,
            description: lessonData.description || '',
            objective: lessonData.objective || '',
            content: lessonData.content || '',
            duration_minutes: lessonData.duration_minutes || 45,
            lesson_date: lessonData.lesson_date || '',
            lesson_time: lessonData.lesson_time || '',
            status: lessonData.status || 'draft',
          })

          // Fetch resources
          const { data: resourcesData } = await supabase
            .from('resources')
            .select('*')
            .eq('lesson_id', lessonId)

          setResources(resourcesData || [])
        }
      } catch (error) {
        console.error('Error fetching lesson:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId, supabase])

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update(formData)
        .eq('id', lessonId)

      if (error) throw error

      setLesson({ ...lesson, ...formData })
      setIsEditing(false)
      alert('Lesson updated successfully')
    } catch (error) {
      console.error('Error updating lesson:', error)
      alert('Failed to update lesson')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lesson?')) return

    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId)

      if (error) throw error

      router.push('/dashboard/lessons')
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Failed to delete lesson')
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)

      if (error) throw error

      setResources(resources.filter((r) => r.id !== resourceId))
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource')
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading lesson...</p>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Lesson not found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/lessons">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card className="p-6 border-0 shadow-sm max-w-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Lesson Details</h2>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Learning Objective</label>
                <Input
                  value={formData.objective}
                  onChange={(e) =>
                    setFormData({ ...formData, objective: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: parseInt(e.target.value),
                      })
                    }
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  >
                    <option value="draft">Draft</option>
                    <option value="planned">Planned</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Lesson Date</label>
                  <Input
                    type="date"
                    value={formData.lesson_date}
                    onChange={(e) =>
                      setFormData({ ...formData, lesson_date: e.target.value })
                    }
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Lesson Time</label>
                  <Input
                    type="time"
                    value={formData.lesson_time}
                    onChange={(e) =>
                      setFormData({ ...formData, lesson_time: e.target.value })
                    }
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="ml-auto"
                  >
                    Delete Lesson
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-6">
          <Card className="p-6 border-0 shadow-sm max-w-4xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Lesson Content</h2>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono disabled:bg-gray-50"
                  rows={12}
                  placeholder="Add your lesson content, notes, instructions, etc."
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Content
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6">
          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>

            {resources.length > 0 ? (
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.resource_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.file_url && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">
                No resources attached to this lesson yet
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
