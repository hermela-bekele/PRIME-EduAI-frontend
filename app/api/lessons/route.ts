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
      .from('lessons')
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

    const { data: lessons, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
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

    const { data: newLesson, error } = await supabase
      .from('lessons')
      .insert([
        {
          class_id: body.class_id,
          title: body.title,
          description: body.description,
          objective: body.objective,
          content: body.content,
          duration_minutes: body.duration_minutes || 45,
          lesson_date: body.lesson_date,
          status: body.status || 'draft',
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(newLesson?.[0], { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
