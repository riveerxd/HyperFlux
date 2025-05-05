'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Copy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { FileLink } from '@prisma/client'
import { CustomCalendar } from '@/components/ui/CustomCalendar'

interface CreateLinkDialogProps {
  fileId: string
  filename: string
  children: React.ReactNode
}

export default function CreateLinkDialog({ fileId, filename, children }: CreateLinkDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeLinks, setActiveLinks] = useState<FileLink[]>([])
  const { toast } = useToast()
  
  const [expiryDate, setExpiryDate] = useState<Date>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 0)
    return tomorrow
  })
  
  const [timeValue, setTimeValue] = useState(format(expiryDate, "HH:mm"))
  
  const fetchActiveLinks = async () => {
    try {
      const response = await fetch(`/api/files/${fileId}/links`)
      if (!response.ok) throw new Error('Failed to fetch links')
      const data = await response.json()
      setActiveLinks(data.links)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load active links"
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchActiveLinks()
    }
  }, [isOpen, fileId])

  const handleCreateLink = async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      if (expiryDate <= now) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Expiry date must be in the future"
        })
        return
      }

      const millisecondsDiff = expiryDate.getTime() - now.getTime()
      const hours = millisecondsDiff / (1000 * 60 * 60)
      
      const response = await fetch(`/api/files/${fileId}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours }),
      })

      if (!response.ok) throw new Error('Failed to create link')

      await fetchActiveLinks()
      
      toast({
        title: 'Success',
        description: 'Link created successfully',
      })
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setExpiryDate(tomorrow)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create link"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/link/${linkId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete link')
      
      setActiveLinks(activeLinks.filter(link => link.id !== linkId))
      toast({
        title: 'Success',
        description: 'Link deleted successfully',
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete link"
      })
    }
  }

  const copyToClipboard = (linkId: string) => {
    const url = `${window.location.origin}/api/files/${fileId}?linkId=${linkId}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'Success',
      description: 'Link copied to clipboard',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Sharing Links</DialogTitle>
          <DialogDescription>
            Create and manage temporary sharing links for "{filename}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Create New Link</Label>
            <div className="space-y-4">
              <div className="grid gap-4">
                <Label>Expiration Date & Time</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(expiryDate, "MMMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CustomCalendar
                        value={expiryDate}
                        onChange={(date) => {
                          const newDate = new Date(date)
                          newDate.setHours(expiryDate.getHours())
                          newDate.setMinutes(expiryDate.getMinutes())
                          setExpiryDate(newDate)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-full sm:w-[150px]"
                      value={timeValue}
                      onChange={(e) => {
                        setTimeValue(e.target.value)
                        
                        if (e.target.value.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
                          const [hours, minutes] = e.target.value.split(':')
                          const newDate = new Date(expiryDate)
                          newDate.setHours(parseInt(hours), parseInt(minutes), 0)
                          setExpiryDate(newDate)
                        }
                      }}
                      onBlur={() => {
                        if (!timeValue.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
                          setTimeValue(format(expiryDate, "HH:mm"))
                        }
                      }}
                    />
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleCreateLink} 
                disabled={isLoading || expiryDate <= new Date()}
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Active Links</Label>
            {activeLinks.length > 0 ? (
              <div className="space-y-2">
                {activeLinks.map((link) => (
                  <Card key={link.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Expires: {new Date(link.expiresAt).toLocaleString('cs-CZ', {
                            year: 'numeric',
                            month: 'numeric', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          }).replace(/\s+/g, '').replace(/(\d{4})/, '$1 ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Downloads: {link.downloads}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(link.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active links</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}