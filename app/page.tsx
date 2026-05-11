'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Brain, BarChart3, FileText, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/40 to-blue-100/60">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PRIME Teaching</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Teaching, <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            PRIME Teaching helps educators create engaging lessons, manage student progress, and unlock time for what matters most—connecting with students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg"
              >
                Start Free Trial
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Everything Teachers Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Lesson Creator</h3>
              <p className="text-gray-600">
                Generate lesson plans, curriculum guides, and assessment questions instantly with AI assistance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Student Management</h3>
              <p className="text-gray-600">
                Organize classes, track attendance, and manage student information all in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Analytics</h3>
              <p className="text-gray-600">
                Monitor student performance with intuitive dashboards and detailed progress reports.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Resource Library</h3>
              <p className="text-gray-600">
                Store, organize, and share teaching materials with your students and colleagues.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Assessments</h3>
              <p className="text-gray-600">
                Create, distribute, and grade assessments with AI-powered grading assistance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Curriculum Planning</h3>
              <p className="text-gray-600">
                Plan and organize your curriculum with AI-generated suggestions and content mapping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-indigo-600 to-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Teaching?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join educators worldwide who are saving time and creating better learning experiences with PRIME Teaching.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 text-lg"
            >
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">PRIME Teaching</span>
            </div>
            <p className="text-sm text-gray-400">AI-powered education platform for modern teachers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 PRIME Teaching. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
