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

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 2; // 10GB
const ALLOWED_FILE_TYPES = ['*/*']; // Allow all file types

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !session) return

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5GB',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
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
            const progress = Math.round((event.loaded * 100) / event.total)
            setUploadProgress(progress)
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
        description: 'File uploaded successfully',
      })
      setFile(null)
      setUploadProgress(0)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="p-8 ">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Upload New File</h2>
          <p className="text-muted-foreground">Select or drag a file to begin sharing</p>
        </div>

        <div 
          className={`
            border-2 border-dashed rounded-lg p-8
            ${isUploading ? 'border-primary' : 'border-muted hover:border-muted-foreground'}
            transition-colors duration-200
            flex flex-col items-center justify-center
            cursor-pointer
            relative
          `}
        >
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isUploading}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-0 file:hidden"
          />
          {file ? (
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-sm">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                disabled={isUploading}
              >
                ✕
              </Button>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Click or drag file to upload
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
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload File
            </>
          )}
        </Button>
      </form>
    </Card>
  )
} 