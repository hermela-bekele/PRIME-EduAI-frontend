import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getAiModel } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const model = getAiModel()
    const { lessonPlan, subject, gradeLevel, includeCommonMisconceptions } = await request.json()

    if (!lessonPlan) {
      return NextResponse.json({ error: 'Missing lesson plan' }, { status: 400 })
    }

    const prompt = `You are an expert educator. Generate comprehensive teaching notes for the following lesson plan.

Subject: ${subject || 'General'}
Grade Level: ${gradeLevel || 'Not specified'}
Include Common Misconceptions: ${includeCommonMisconceptions ? 'Yes' : 'No'}

Lesson Plan:
${typeof lessonPlan === 'string' ? lessonPlan : JSON.stringify(lessonPlan, null, 2)}

Please create detailed teaching notes that include:

1. **Content Overview**
   - Key concepts and their connections
   - Historical/contextual background

2. **Instructional Strategies**
   - Best practices for teaching this content
   - Pedagogical approaches that work well
   - Technology integration options

3. **Explaining Key Concepts**
   - Detailed explanations for each major concept
   - Analogies and metaphors that help students understand
   - Visual representations (describe what diagrams/charts would help)

4. **Common Misconceptions & How to Address Them**
   ${includeCommonMisconceptions ? '- Student misconceptions about this topic\n   - How to identify if students have these misconceptions\n   - Strategies to correct these misconceptions' : ''}

5. **Questioning Strategies**
   - Higher-order thinking questions to ask during the lesson
   - Probing questions to deepen understanding
   - Assessment questions to check understanding

6. **Differentiation Tips**
   - For struggling learners
   - For advanced learners
   - For different learning styles

7. **Real-World Applications**
   - How this content applies to students' lives
   - Career connections
   - Practical examples

8. **Common Challenges**
   - Timing issues and how to manage them
   - Classroom management tips for this type of lesson
   - How to handle unexpected questions or disruptions

9. **Extension Ideas**
   - Cross-curricular connections
   - Ways to extend the lesson
   - Further investigation topics

10. **Assessment Rubrics**
    - How to evaluate student understanding
    - Rubric for grading activities
    - Success criteria for learning objectives

Format as a comprehensive, well-organized JSON document that teachers can reference while planning and teaching.`

    const response = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 5000,
    })

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      const teachingNotes = jsonMatch ? JSON.parse(jsonMatch[0]) : null
      return NextResponse.json({ teachingNotes: teachingNotes || response.text })
    } catch {
      return NextResponse.json({ teachingNotes: response.text })
    }
  } catch (error) {
    console.error('Teaching notes generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate teaching notes' },
      { status: 500 },
    )
  }
}
