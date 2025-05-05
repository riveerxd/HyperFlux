'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2, Upload } from 'lucide-react'
import { TempFile } from '@prisma/client'

interface FileUploadProps {
  onFileUploaded: (file: TempFile) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 2; 
const ALLOWED_FILE_TYPES = ['*/*'];

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0 || !session) return

    // Check if any file exceeds the size limit
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      toast({
        title: 'Error',
        description: `${oversizedFiles.length} file(s) exceed the 5GB size limit`,
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    
    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          
          xhr.timeout = 3600000; // 1 hour timeout
          xhr.ontimeout = () => {
            reject(new Error('Upload timed out'))
          }

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              // Calculate overall progress based on current file and its progress
              const fileProgress = Math.round((event.loaded * 100) / event.total)
              const overallProgress = Math.round((i * 100 + fileProgress) / files.length)
              setUploadProgress(overallProgress)
            }
          })

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.response))
            } else {
              reject(new Error(xhr.responseText || 'Upload failed'))
            }
          })

          xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred'))
          })

          xhr.open('POST', '/api/upload')
          xhr.send(formData)
        })

        if (response.file) {
          onFileUploaded(response.file)
        }

        toast({
          title: 'Success',
          description: `File ${file.name} uploaded successfully`,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error 
            ? `Failed to upload ${file.name}: ${error.message}` 
            : `Failed to upload ${file.name}`,
          variant: 'destructive',
        })
      }
    }
    
    setFiles([])
    setUploadProgress(0)
    setIsUploading(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Convert FileList to array and add to existing files
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card className="p-8 ">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Upload New Files</h2>
          <p className="text-muted-foreground">Select or drag files to begin sharing</p>
        </div>

        <div 
          className={`
            border-2 border-dashed rounded-lg p-8
            ${dragActive ? 'border-primary bg-primary/5' : ''}
            ${isUploading ? 'border-primary' : 'border-muted hover:border-muted-foreground'}
            transition-colors duration-200
            flex flex-col items-center justify-center
            cursor-pointer
            relative
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            id="file"
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-0 file:hidden"
          />
          {files.length > 0 ? (
            <div className="flex flex-col gap-2 w-full relative z-10">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={isUploading}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Click or drag files to upload
            </span>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload {files.length > 0 ? `${files.length} Files` : 'Files'}
            </>
          )}
        </Button>
      </form>
    </Card>
  )
} 