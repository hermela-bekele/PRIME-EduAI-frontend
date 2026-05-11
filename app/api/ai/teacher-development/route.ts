import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getAiModel } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const model = getAiModel()
    const { trainingMaterials, focusArea, teachingLevel, specificChallenges } = await request.json()

    if (!trainingMaterials) {
      return NextResponse.json({ error: 'Missing training materials' }, { status: 400 })
    }

    const prompt = `You are an expert in teacher professional development and educational coaching. Generate a comprehensive teacher development plan based on the following training materials.

Teaching Level: ${teachingLevel || 'Not specified'}
Focus Area: ${focusArea || 'General Teaching Excellence'}
Specific Challenges: ${specificChallenges || 'None specified'}

Training Materials:
${trainingMaterials}

Please create a detailed teacher development plan that includes:

1. **Assessment of Current Practice**
   - Key indicators of current teaching effectiveness
   - Areas of strength to build upon
   - Growth areas identified in the materials

2. **Learning Outcomes**
   - Specific skills to develop
   - Knowledge to acquire
   - Habits to build or change

3. **Development Goals**
   - Short-term goals (1-3 months)
   - Medium-term goals (3-6 months)
   - Long-term goals (6-12 months)
   - How to measure progress for each goal

4. **Recommended Training Activities**
   - Professional learning communities
   - Peer observation and feedback
   - Mentoring relationships
   - Online courses or certifications
   - Reading recommendations
   - Workshop suggestions

5. **Action Plan**
   - Step-by-step implementation strategy
   - Timeline for each action
   - Resources needed
   - Success criteria

6. **Reflective Practice Framework**
   - Journaling prompts for self-reflection
   - Questions to ask after each lesson
   - How to analyze student data
   - Reflection templates

7. **Classroom Application**
   - How to apply training materials in daily teaching
   - Practical strategies to implement
   - Lesson planning adjustments
   - Assessment modifications

8. **Collaboration & Support**
   - How to involve colleagues in your development
   - Finding mentors or instructional coaches
   - Sharing learning with staff
   - Building professional networks

9. **Student Impact**
   - Expected improvements in student learning
   - Metrics to track student progress
   - How improved teaching practices benefit different learners
   - Technology integration opportunities

10. **Ongoing Professional Learning**
    - How to stay current in the field
    - Continuing education resources
    - Next steps after completing this plan
    - How to model professional growth for colleagues

11. **Resource List**
    - Books and articles
    - Websites and online platforms
    - Professional organizations
    - Technology tools

Format as a comprehensive, actionable JSON document with clear sections that a teacher can use as a personal development roadmap.`

    const response = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 5500,
    })

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      const developmentPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : null
      return NextResponse.json({ developmentPlan: developmentPlan || response.text })
    } catch {
      return NextResponse.json({ developmentPlan: response.text })
    }
  } catch (error) {
    console.error('Teacher development error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate teacher development plan' },
      { status: 500 },
    )
  }
}
