import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')
    const studentId = searchParams.get('studentId')

    let query = supabase.from('student_grades').select(`
      *,
      assessments:assessment_id(title, total_points),
      students:student_id(name, email)
    `)

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId)
    }

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data: grades, error } = await query.order('graded_at', {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: newGrade, error } = await supabase
      .from('student_grades')
      .insert([
        {
          assessment_id: body.assessment_id,
          student_id: body.student_id,
          points_earned: body.points_earned,
          feedback: body.feedback,
          submitted_at: body.submitted_at,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(newGrade?.[0], { status: 201 })
  } catch (error) {
    console.error('Error creating grade:', error)
    return NextResponse.json(
      { error: 'Failed to create grade' },
      { status: 500 }
    )
  }
}
