import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getAiModel } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const model = getAiModel()

    const { textbookContent, learningDays, gradeLevel, subject } = await request.json()

    if (!textbookContent) {
      return NextResponse.json({ error: 'Missing textbook content' }, { status: 400 })
    }

    const prompt = `You are an expert curriculum designer. Analyze the following textbook/curriculum content and break it down into ${learningDays} learning sessions based on the learning calendar.

Subject: ${subject || 'General'}
Grade Level: ${gradeLevel || 'Not specified'}
Learning Days Available: ${learningDays}

Content to break down:
${textbookContent}

Please provide:
1. A breakdown of key concepts and topics for each session
2. Learning objectives for each session
3. Estimated time allocation (in hours)
4. Key materials/resources needed
5. Assessment points
6. Prerequisite knowledge for each session

Format as a structured JSON array with each session containing: session_number, title, learning_objectives, topics, duration_hours, resources_needed, assessment_points, prerequisites`

    const response = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 4000,
    })

    try {
      const jsonMatch = response.text.match(/\[[\s\S]*\]/)
      const sessions = jsonMatch ? JSON.parse(jsonMatch[0]) : null
      return NextResponse.json({ sessions: sessions || response.text })
    } catch {
      return NextResponse.json({ sessions: response.text })
    }
  } catch (error) {
    console.error('Curriculum breakdown error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate curriculum breakdown' },
      { status: 500 },
    )
  }
}
