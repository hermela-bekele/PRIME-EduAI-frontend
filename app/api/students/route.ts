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

    let query = supabase.from('students').select('*')

    if (classId) {
      query = query.eq('class_id', classId)
    } else {
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id)

      if (classesError) throw classesError

      const classIds = classes?.map((c: any) => c.id) || []
      if (classIds.length === 0) {
        return NextResponse.json([])
      }

      query = query.in('class_id', classIds)
    }

    const { data: students, error } = await query.order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
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

    const { data: newStudent, error } = await supabase
      .from('students')
      .insert([
        {
          class_id: body.class_id,
          name: body.name,
          email: body.email,
          enrollment_date: body.enrollment_date || new Date().toISOString().split('T')[0],
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(newStudent?.[0], { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
