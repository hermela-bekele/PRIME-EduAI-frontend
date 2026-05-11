import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getAiModel } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const model = getAiModel()
    const { resources, learningObjectives, gradeLevel, duration, subject } = await request.json()

    if (!resources) {
      return NextResponse.json({ error: 'Missing resources' }, { status: 400 })
    }

    const prompt = `You are an experienced teacher and curriculum designer. Create a comprehensive lesson plan based on the following resources and objectives.

Subject: ${subject || 'General'}
Grade Level: ${gradeLevel || 'Not specified'}
Duration: ${duration || '45'} minutes
Learning Objectives: ${learningObjectives || 'Not specified'}

Available Resources:
${resources}

Please create a detailed lesson plan that includes:
1. Lesson Title and Summary
2. Learning Outcomes (aligned with objectives)
3. Materials and Resources Needed
4. Lesson Introduction/Hook (5-10 minutes)
5. Main Instruction/Content Delivery (15-25 minutes)
   - Key concepts to cover
   - Teaching strategies and methods
   - Examples and real-world applications
6. Student Activities/Practice (10-15 minutes)
   - Guided practice
   - Independent practice
7. Assessment Methods
   - Formative assessment during lesson
   - Exit ticket or checkpoint
8. Closure and Summary (3-5 minutes)
9. Differentiation Strategies for diverse learners
10. Extensions for advanced students
11. Home Learning/Homework (if applicable)

Format as a structured JSON object with clear sections for easy implementation.`

    const response = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 4500,
    })

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      const lessonPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : null
      return NextResponse.json({ lessonPlan: lessonPlan || response.text })
    } catch {
      return NextResponse.json({ lessonPlan: response.text })
    }
  } catch (error) {
    console.error('Lesson plan generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate lesson plan' },
      { status: 500 },
    )
  }
}
