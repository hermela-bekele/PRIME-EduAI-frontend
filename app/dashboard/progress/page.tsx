'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, AlertCircle, Clock3, CheckCheck } from 'lucide-react'
import { normalizeRole, type AppRole } from '@/lib/roles'

interface Student {
  id: string
  name: string
  class_id: string
  email: string
}

interface Grade {
  id: string
  student_id: string
  assessment_id: string
  points_earned: number
  feedback: string
}

interface Assessment {
  id: string
  title: string
  total_points: number
  assessment_type: string
}

interface Class {
  id: string
  name: string
}

interface TeacherProgressRow {
  teacherId: string
  teacherName: string
  teacherEmail: string
  classes: number
  lessonsAssigned: number
  lessonsDelivered: number
  overdueSessions: number
  pendingReviews: number
  assessments: number
  completion: number
}

interface DepartmentTeacherProgressResponse {
  summary: {
    teachers: number
    avgCompletion: number
    overdueSessions: number
    pendingReviews: number
  }
  teachers: TeacherProgressRow[]
}

export default function ProgressPage() {
  const supabase = createClient()
  const [role, setRole] = useState<AppRole>('teacher')
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [teacherProgress, setTeacherProgress] = useState<TeacherProgressRow[]>([])
  const [teacherSummary, setTeacherSummary] = useState<DepartmentTeacherProgressResponse['summary']>({
    teachers: 0,
    avgCompletion: 0,
    overdueSessions: 0,
    pendingReviews: 0,
  })
  const [teacherFilter, setTeacherFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'teachers' | 'overdue' | 'pending'>('teachers')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        const resolvedRole = normalizeRole(
          (profileData as { role?: string } | null)?.role || user.user_metadata?.role,
        )
        setRole(resolvedRole)

        if (resolvedRole === 'department_head') {
          const teacherProgressRes = await fetch('/api/department/teacher-progress')
          if (teacherProgressRes.ok) {
            const progressData: DepartmentTeacherProgressResponse = await teacherProgressRes.json()
            setTeacherSummary(progressData.summary)
            setTeacherProgress(progressData.teachers)
          }
          return
        }
      }

      const [classesRes, gradesRes, assessmentsRes, studentsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/grades'),
        fetch('/api/assessments'),
        fetch('/api/students'),
      ])

      if (!classesRes.ok || !gradesRes.ok || !assessmentsRes.ok || !studentsRes.ok) return

      const classesData = await classesRes.json()
      const gradesData = await gradesRes.json()
      const assessmentsData = await assessmentsRes.json()
      const studentsData = await studentsRes.json()

      setClasses(classesData)
      setGrades(gradesData)
      setAssessments(assessmentsData)
      setStudents(studentsData)

      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStudentsForClass = () => {
    return students.filter((s) => s.class_id === selectedClass)
  }

  const getStudentGrades = (studentId: string) => {
    return grades.filter((g) => g.student_id === studentId)
  }

  const calculateStudentAverage = (studentId: string) => {
    const studentGrades = getStudentGrades(studentId)
    if (studentGrades.length === 0) return 0
    const total = studentGrades.reduce((sum, g) => sum + g.points_earned, 0)
    return Math.round((total / (studentGrades.length * 100)) * 100)
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const classStudents = getStudentsForClass()
  const filteredTeachers = teacherProgress
    .filter((teacher) => teacher.teacherName.toLowerCase().includes(teacherFilter.toLowerCase()))
    .filter((teacher) => {
      if (activeTab === 'overdue') return teacher.overdueSessions > 0
      if (activeTab === 'pending') return teacher.pendingReviews > 0
      return true
    })

  if (role === 'department_head' && !loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-700">Department Head</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Teacher Progress</h1>
          <p className="text-sm text-slate-600">
            Track each teacher&apos;s delivery status, completion, overdue sessions, and pending reviews.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200"><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teachers</p><p className="mt-2 text-4xl font-semibold text-slate-900">{teacherSummary.teachers}</p></CardContent></Card>
          <Card className="border-slate-200"><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Completion</p><p className="mt-2 text-4xl font-semibold text-slate-900">{teacherSummary.avgCompletion}%</p></CardContent></Card>
          <Card className="border-slate-200"><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue Sessions</p><p className="mt-2 text-4xl font-semibold text-slate-900">{teacherSummary.overdueSessions}</p></CardContent></Card>
          <Card className="border-slate-200"><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Reviews</p><p className="mt-2 text-4xl font-semibold text-slate-900">{teacherSummary.pendingReviews}</p></CardContent></Card>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant={activeTab === 'teachers' ? 'default' : 'outline'} onClick={() => setActiveTab('teachers')}>Teachers</Button>
          <Button type="button" size="sm" variant={activeTab === 'overdue' ? 'default' : 'outline'} onClick={() => setActiveTab('overdue')}>Overdue</Button>
          <Button type="button" size="sm" variant={activeTab === 'pending' ? 'default' : 'outline'} onClick={() => setActiveTab('pending')}>Pending Reviews</Button>
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Filter by teacher name..."
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
          />
        </div>

        {filteredTeachers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-slate-600">
              No teacher records found for the selected filter.
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.teacherId} className="border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{teacher.teacherName}</CardTitle>
                      <CardDescription>{teacher.teacherEmail}</CardDescription>
                    </div>
                    {teacher.overdueSessions > 0 && (
                      <Badge variant="destructive">{teacher.overdueSessions} overdue</Badge>
                    )}
                  </div>
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Completion</span>
                      <span className="font-semibold text-slate-800">{teacher.completion}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${teacher.completion}%` }} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-emerald-50 py-2">
                      <p className="font-semibold text-emerald-700">{teacher.lessonsDelivered}</p>
                      <p className="text-emerald-600">Delivered</p>
                    </div>
                    <div className="rounded-lg bg-rose-50 py-2">
                      <p className="font-semibold text-rose-700">{teacher.overdueSessions}</p>
                      <p className="text-rose-600">Overdue</p>
                    </div>
                    <div className="rounded-lg bg-slate-100 py-2">
                      <p className="font-semibold text-slate-700">{teacher.pendingReviews}</p>
                      <p className="text-slate-600">Pending</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>Classes: <strong>{teacher.classes}</strong></div>
                    <div>Assessments: <strong>{teacher.assessments}</strong></div>
                    <div>Assigned: <strong>{teacher.lessonsAssigned}</strong></div>
                    <div>Delivered: <strong>{teacher.lessonsDelivered}</strong></div>
                  </div>
                  <Button variant="outline" className="w-full gap-2" type="button">
                    <CheckCheck className="h-4 w-4" />
                    Add comment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </div>
    )
  }

  const classStats = {
    totalStudents: classStudents.length,
    averagePerformance:
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((sum, s) => sum + calculateStudentAverage(s.id), 0) /
              classStudents.length
          )
        : 0,
    studentsNeedingSupport: classStudents.filter(
      (s) => calculateStudentAverage(s.id) < 70
    ).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading progress data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Progress</h1>
        <p className="text-gray-600 mt-1">Track and analyze student performance across assessments</p>
      </div>

      {classes.length > 0 && (
        <div>
          <label className="text-sm font-medium">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="mt-2 w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classStats.totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">in selected class</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Class Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getGradeColor(classStats.averagePerformance)}`}>
              {classStats.averagePerformance}%
            </div>
            <p className="text-xs text-gray-500 mt-1">across all assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Needs Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{classStats.studentsNeedingSupport}</div>
            <p className="text-xs text-gray-500 mt-1">below 70% average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance Overview</CardTitle>
          <CardDescription>Individual student grades and progress</CardDescription>
        </CardHeader>
        <CardContent>
          {classStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p>No students in this class yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Email</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Assessments</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student) => {
                    const average = calculateStudentAverage(student.id)
                    const assessmentCount = getStudentGrades(student.id).length
                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{student.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                        <td className="text-right py-3 px-4 text-sm">{assessmentCount}</td>
                        <td className={`text-right py-3 px-4 text-sm font-semibold ${getGradeColor(average)}`}>
                          {average}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Breakdown</CardTitle>
          <CardDescription>Performance by assessment type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['quiz', 'assignment', 'test', 'project'].map((type) => {
              const typeAssessments = assessments.filter((a) => a.assessment_type === type && a.id)
              if (typeAssessments.length === 0) return null
              return (
                <div key={type} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-sm capitalize mb-2">{type}s</h4>
                  <p className="text-2xl font-bold text-gray-900">{typeAssessments.length}</p>
                  <p className="text-xs text-gray-600 mt-1">assessments created</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
