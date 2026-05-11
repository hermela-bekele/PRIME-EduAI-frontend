'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, Trash2, Download, Folder } from 'lucide-react'

interface File {
  id: string
  name: string
  type: string
  size: number
  uploadedDate: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([
    {
      id: '1',
      name: 'Quadratic Equations Practice Problems.pdf',
      type: 'pdf',
      size: 2400000,
      uploadedDate: '2026-05-03',
    },
    {
      id: '2',
      name: 'Functions Unit Overview.docx',
      type: 'docx',
      size: 1200000,
      uploadedDate: '2026-05-01',
    },
    {
      id: '3',
      name: 'Assessment Rubric.xlsx',
      type: 'xlsx',
      size: 850000,
      uploadedDate: '2026-04-28',
    },
  ])
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles) return

    setUploading(true)
    setTimeout(() => {
      Array.from(uploadedFiles).forEach((file) => {
        const newFile: File = {
          id: Math.random().toString(),
          name: file.name,
          type: file.type.split('/')[1] || 'unknown',
          size: file.size,
          uploadedDate: new Date().toISOString().split('T')[0],
        }
        setFiles([newFile, ...files])
      })
      setUploading(false)
    }, 1000)
  }

  const handleDeleteFile = (id: string) => {
    if (!confirm('Delete this file?')) return
    setFiles(files.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'docx':
      case 'doc':
        return '📝'
      case 'xlsx':
      case 'xls':
        return '📊'
      case 'pptx':
      case 'ppt':
        return '🎯'
      default:
        return '📎'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Curriculum Resources</h1>
        <p className="text-gray-600 mt-1">Manage lesson materials, assignments, and curriculum documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New File</CardTitle>
          <CardDescription>Drag and drop or click to upload lesson materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Click to upload files</p>
              <p className="text-sm text-gray-600 mt-1">or drag and drop</p>
              <p className="text-xs text-gray-500 mt-2">PDF, DOCX, XLSX, PPTX up to 50MB</p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
          <CardDescription>{files.length} files uploaded</CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No files uploaded yet. Upload your first curriculum resource.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        /* Download functionality */
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 transition"
                      title="Download file"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition"
                      title="Delete file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organize Your Resources</CardTitle>
          <CardDescription>Create folders to organize curriculum materials by class or topic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Grade 11 Mathematics A', 'Grade 11 Mathematics B', 'Assessment Templates'].map((folder) => (
              <div
                key={folder}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
              >
                <Folder className="w-8 h-8 text-yellow-500 mb-2" />
                <p className="font-medium text-sm">{folder}</p>
                <p className="text-xs text-gray-600 mt-1">0 items</p>
              </div>
            ))}
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition cursor-pointer flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 text-sm">+ Create Folder</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
