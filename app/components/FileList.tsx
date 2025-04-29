'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trash2, Download, Search, Link, 
  FileIcon, FolderIcon, ChevronLeft, 
  ChevronRight, Loader2 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import CreateLinkDialog from './CreateLinkDialog'

interface TempFile {
  id: string
  filename: string
  createdAt: string
  downloads: number
  user: {
    email: string
    name: string
  }
}

interface FileListProps {
  files: TempFile[]
  setFiles: React.Dispatch<React.SetStateAction<TempFile[]>>
}

const ITEMS_PER_PAGE = 10

export default function FileList({ files = [], setFiles }: FileListProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/files')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch files')
        }
        const data = await response.json()
        setFiles(data.files)
        setIsAdmin(data.isAdmin)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load files'
        setError(message)
        toast({
          variant: "destructive",
          title: "Database Error",
          description: message
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [toast, setFiles])

  const handleDelete = async (fileId: string, filename: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete file')
      
      setFiles(files.filter(file => file.id !== fileId))
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete file"
      })
    }
  }

  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE)
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="text-destructive text-lg font-semibold">
          Unable to connect to database
        </div>
        <div className="text-muted-foreground text-sm">
          {error}
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isAdmin ? 'All Uploaded Files' : 'Your Uploaded Files'}
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Downloads</TableHead>
              {isAdmin && <TableHead>Uploaded By</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFiles.map((file) => (
              <TableRow key={file.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    {file.filename}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(file.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {file.downloads}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-muted-foreground">
                    {file.user.email}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <CreateLinkDialog fileId={file.id} filename={file.filename}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </CreateLinkDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete File</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{file.filename}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(file.id, file.filename)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          {searchQuery ? 'No files match your search.' : 'No files uploaded yet.'}
        </div>
      )}
    </div>
  )
} 