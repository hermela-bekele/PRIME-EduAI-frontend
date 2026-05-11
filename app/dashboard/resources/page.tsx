'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Upload, FileText, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function ResourcesPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tools</h1>
          <p className="text-gray-600">Generate lessons, assessments, and curriculum with AI</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Zap className="w-4 h-4 mr-2" />
              Generate Content
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI Content Generation</DialogTitle>
              <DialogDescription>
                Upload documents or provide text to generate lessons, assessments, and curriculum
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Upload curriculum or lesson materials
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  PDF, Word, or text files (Max 10MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Choose File
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 cursor-pointer hover:bg-indigo-50 border border-gray-200">
                  <Sparkles className="w-6 h-6 text-indigo-600 mb-2" />
                  <h3 className="font-semibold text-sm text-gray-900">Generate Lesson</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Create a complete lesson plan
                  </p>
                </Card>

                <Card className="p-4 cursor-pointer hover:bg-indigo-50 border border-gray-200">
                  <Sparkles className="w-6 h-6 text-indigo-600 mb-2" />
                  <h3 className="font-semibold text-sm text-gray-900">Generate Assessment</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Create quiz or test questions
                  </p>
                </Card>

                <Card className="p-4 cursor-pointer hover:bg-indigo-50 border border-gray-200 col-span-2">
                  <Sparkles className="w-6 h-6 text-indigo-600 mb-2" />
                  <h3 className="font-semibold text-sm text-gray-900">Extract Curriculum</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Extract key concepts and topics
                  </p>
                </Card>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Generate with AI
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Generate Lesson Plan</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload curriculum materials and generate a complete lesson plan powered by AI
          </p>
          <Button variant="outline" className="w-full">
            Get Started
          </Button>
        </Card>

        <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Generate Assessment</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create tailored quizzes and test questions based on your lesson content
          </p>
          <Button variant="outline" className="w-full">
            Get Started
          </Button>
        </Card>

        <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Extract Curriculum</h3>
          <p className="text-sm text-gray-600 mb-4">
            Automatically extract key concepts, learning objectives, and topics
          </p>
          <Button variant="outline" className="w-full">
            Get Started
          </Button>
        </Card>
      </div>

      <Card className="mt-8 p-8 border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Pro Tip: Use AI for Content</h3>
            <p className="text-gray-600 mb-4">
              Upload your existing lesson materials (PDFs, Word docs, etc.) and let AI help you create comprehensive lesson plans, assessments, and extract curriculum structure. This saves hours of planning time!
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Automatically generates learning objectives</li>
              <li>✓ Creates aligned assessments</li>
              <li>✓ Suggests interactive activities</li>
              <li>✓ Identifies key concepts</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
