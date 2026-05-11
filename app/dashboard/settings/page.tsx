'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    school: '',
    department: '',
  })
  const [classFormData, setClassFormData] = useState({
    name: '',
    subject: '',
    grade_level: '',
    description: '',
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setFormData({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            school: profileData.school || '',
            department: profileData.department || '',
          })
        }

        // Fetch classes
        const { data: classesData } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)

        setClasses(classesData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [supabase])

  const handleUpdateProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (error) throw error

      setIsEditing(false)
      alert('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleCreateClass = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !classFormData.name || !classFormData.subject) {
        alert('Please fill in required fields')
        return
      }

      const { error } = await supabase.from('classes').insert([
        {
          teacher_id: user.id,
          name: classFormData.name,
          subject: classFormData.subject,
          grade_level: classFormData.grade_level,
          description: classFormData.description,
        },
      ])

      if (error) throw error

      setClassFormData({
        name: '',
        subject: '',
        grade_level: '',
        description: '',
      })

      // Refresh classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)

      setClasses(classesData || [])
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Failed to create class')
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const { error } = await supabase.from('classes').delete().eq('id', id)

      if (error) throw error

      setClasses(classes.filter((c) => c.id !== id))
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Failed to delete class')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your profile, classes, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="p-6 border-0 shadow-sm max-w-2xl">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-sm text-gray-600">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">School</label>
                <Input
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                  <>
                    <Button
                      onClick={handleUpdateProfile}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="mt-6">
          <div className="space-y-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Add a new class for your students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Class Name</label>
                    <Input
                      placeholder="e.g., Biology 101"
                      value={classFormData.name}
                      onChange={(e) =>
                        setClassFormData({ ...classFormData, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <Input
                      placeholder="e.g., Biology"
                      value={classFormData.subject}
                      onChange={(e) =>
                        setClassFormData({ ...classFormData, subject: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Grade Level</label>
                    <Input
                      placeholder="e.g., 10th Grade"
                      value={classFormData.grade_level}
                      onChange={(e) =>
                        setClassFormData({
                          ...classFormData,
                          grade_level: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      placeholder="Brief description of the class"
                      value={classFormData.description}
                      onChange={(e) =>
                        setClassFormData({
                          ...classFormData,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleCreateClass}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Class
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {classes.length > 0 ? (
              <div className="grid gap-4">
                {classes.map((cls) => (
                  <Card key={cls.id} className="p-4 border-0 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {cls.subject}
                          {cls.grade_level && ` • ${cls.grade_level}`}
                        </p>
                        {cls.description && (
                          <p className="text-sm text-gray-600 mt-2">{cls.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-0 shadow-sm">
                <p className="text-gray-600 mb-4">No classes yet</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Class</DialogTitle>
                      <DialogDescription>
                        Add a new class for your students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Class Name</label>
                        <Input
                          placeholder="e.g., Biology 101"
                          value={classFormData.name}
                          onChange={(e) =>
                            setClassFormData({ ...classFormData, name: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <Input
                          placeholder="e.g., Biology"
                          value={classFormData.subject}
                          onChange={(e) =>
                            setClassFormData({
                              ...classFormData,
                              subject: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Grade Level</label>
                        <Input
                          placeholder="e.g., 10th Grade"
                          value={classFormData.grade_level}
                          onChange={(e) =>
                            setClassFormData({
                              ...classFormData,
                              grade_level: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          placeholder="Brief description of the class"
                          value={classFormData.description}
                          onChange={(e) =>
                            setClassFormData({
                              ...classFormData,
                              description: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleCreateClass}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        Create Class
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card className="p-6 border-0 shadow-sm max-w-2xl">
            <div className="flex items-start gap-4 mb-6">
              <Lock className="w-6 h-6 text-gray-400 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Password</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Change your password to keep your account secure
                </p>
                <Button variant="outline">Change Password</Button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Active Sessions</h3>
              <p className="text-sm text-gray-600 mb-4">
                You&apos;re currently signed in to this browser
              </p>
              <Button variant="outline">Sign Out from All Devices</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
