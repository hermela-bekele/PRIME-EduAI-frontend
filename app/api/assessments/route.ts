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
    const classId = searchParams.get('classId')

    let query = supabase
      .from('assessments')
      .select('*')
      .in(
        'class_id',
        (
          await supabase
            .from('classes')
            .select('id')
            .eq('teacher_id', user.id)
        ).data?.map((c: any) => c.id) || []
      )

    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data: assessments, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
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

    const { data: newAssessment, error } = await supabase
      .from('assessments')
      .insert([
        {
          class_id: body.class_id,
          title: body.title,
          description: body.description,
          assessment_type: body.assessment_type,
          total_points: body.total_points || 100,
          due_date: body.due_date,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(newAssessment?.[0], { status: 201 })
  } catch (error) {
    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    )
  }
}
