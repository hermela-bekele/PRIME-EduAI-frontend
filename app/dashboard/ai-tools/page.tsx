'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Zap, BookMarked, GraduationCap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AIToolsPage() {
  const tools = [
    {
      icon: BookMarked,
      title: 'Curriculum Breakdown',
      description: 'Break down textbooks and resources into organized learning sessions based on your calendar',
      href: '/dashboard/ai-tools/curriculum',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Zap,
      title: 'Lesson Plan Generator',
      description: 'Automatically generate detailed lesson plans from your resources and learning objectives',
      href: '/dashboard/ai-tools/lesson-generator',
      color: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: BookOpen,
      title: 'Teaching Notes',
      description: 'Create comprehensive teaching notes with strategies, misconceptions, and assessment rubrics',
      href: '/dashboard/ai-tools/teaching-notes',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: GraduationCap,
      title: 'Teacher Development',
      description: 'Develop personalized professional growth plans based on training materials',
      href: '/dashboard/ai-tools/teacher-development',
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Teaching Tools</h1>
        <p className="text-gray-600 mt-2">
          Leverage AI to create lesson plans, teaching materials, and professional development resources
        </p>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="h-full hover:shadow-lg transition cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="gap-2 p-0 h-auto">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Save Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Reduce planning time by up to 50% with AI-generated lesson plans and curriculum breakdowns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Improve Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Get research-based teaching strategies and best practices integrated into every resource
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Professional Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Develop your teaching practice with personalized professional development plans
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
