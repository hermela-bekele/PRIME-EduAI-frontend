import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { normalizeRole } from '@/lib/roles'

type TeacherProfile = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

type ClassRow = {
  id: string
  name?: string | null
  teacher_id: string
}

type LessonRow = {
  id: string
  class_id: string
  status?: string | null
  lesson_date?: string | null
}

type AssessmentRow = {
  id: string
  class_id: string
}

const DELIVERED_STATUSES = new Set(['completed', 'done', 'delivered', 'published'])

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const role = normalizeRole(
      (myProfile as { role?: string } | null)?.role || user.user_metadata?.role,
    )

    if (role !== 'department_head' && role !== 'admin' && role !== 'school') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const department = (myProfile as { department?: string } | null)?.department || null

    let teachersQuery = supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role')
      .eq('role', 'teacher')

    if (department) {
      teachersQuery = teachersQuery.eq('department', department)
    }

    const { data: teacherProfiles, error: teachersError } = await teachersQuery
    if (teachersError) throw teachersError

    const teachers = ((teacherProfiles || []) as (TeacherProfile & { role?: string })[]).map((t) => {
      const name = `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.email || 'Unnamed Teacher'
      return { id: t.id, name, email: t.email || '' }
    })

    if (teachers.length === 0) {
      return NextResponse.json({
        summary: { teachers: 0, avgCompletion: 0, overdueSessions: 0, pendingReviews: 0 },
        teachers: [],
      })
    }

    const teacherIds = teachers.map((t) => t.id)

    const { data: classRows, error: classError } = await supabase
      .from('classes')
      .select('id, name, teacher_id')
      .in('teacher_id', teacherIds)
    if (classError) throw classError

    const classes = (classRows || []) as ClassRow[]
    const classIds = classes.map((c) => c.id)

    let lessons: LessonRow[] = []
    let assessments: AssessmentRow[] = []

    if (classIds.length > 0) {
      const [{ data: lessonRows, error: lessonError }, { data: assessmentRows, error: assessmentError }] =
        await Promise.all([
          supabase.from('lessons').select('id, class_id, status, lesson_date').in('class_id', classIds),
          supabase.from('assessments').select('id, class_id').in('class_id', classIds),
        ])

      if (lessonError) throw lessonError
      if (assessmentError) throw assessmentError

      lessons = (lessonRows || []) as LessonRow[]
      assessments = (assessmentRows || []) as AssessmentRow[]
    }

    const today = new Date().toISOString().split('T')[0]

    const classesByTeacher = new Map<string, ClassRow[]>()
    classes.forEach((cls) => {
      const arr = classesByTeacher.get(cls.teacher_id) || []
      arr.push(cls)
      classesByTeacher.set(cls.teacher_id, arr)
    })

    const lessonsByClass = new Map<string, LessonRow[]>()
    lessons.forEach((lesson) => {
      const arr = lessonsByClass.get(lesson.class_id) || []
      arr.push(lesson)
      lessonsByClass.set(lesson.class_id, arr)
    })

    const assessmentsByClass = new Map<string, AssessmentRow[]>()
    assessments.forEach((assessment) => {
      const arr = assessmentsByClass.get(assessment.class_id) || []
      arr.push(assessment)
      assessmentsByClass.set(assessment.class_id, arr)
    })

    const teacherStats = teachers.map((teacher) => {
      const myClasses = classesByTeacher.get(teacher.id) || []
      const myClassIds = myClasses.map((c) => c.id)
      const myLessons = myClassIds.flatMap((id) => lessonsByClass.get(id) || [])
      const myAssessments = myClassIds.flatMap((id) => assessmentsByClass.get(id) || [])

      const assigned = myLessons.length
      const delivered = myLessons.filter((l) => DELIVERED_STATUSES.has((l.status || '').toLowerCase())).length
      const overdue = myLessons.filter((l) => {
        const date = l.lesson_date ? l.lesson_date.split('T')[0] : null
        const done = DELIVERED_STATUSES.has((l.status || '').toLowerCase())
        return !!date && date < today && !done
      }).length
      const pending = Math.max(assigned - delivered - overdue, 0)
      const completion = assigned > 0 ? Math.round((delivered / assigned) * 100) : 0

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        classes: myClasses.length,
        lessonsAssigned: assigned,
        lessonsDelivered: delivered,
        overdueSessions: overdue,
        pendingReviews: pending,
        assessments: myAssessments.length,
        completion,
      }
    })

    const avgCompletion =
      teacherStats.length > 0
        ? Math.round(teacherStats.reduce((sum, t) => sum + t.completion, 0) / teacherStats.length)
        : 0

    const summary = {
      teachers: teacherStats.length,
      avgCompletion,
      overdueSessions: teacherStats.reduce((sum, t) => sum + t.overdueSessions, 0),
      pendingReviews: teacherStats.reduce((sum, t) => sum + t.pendingReviews, 0),
    }

    return NextResponse.json({ summary, teachers: teacherStats })
  } catch (error) {
    console.error('Error fetching department teacher progress:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher progress' }, { status: 500 })
  }
}
