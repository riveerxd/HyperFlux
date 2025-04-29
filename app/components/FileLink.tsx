'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface FileLinkProps {
  fileUrl: string
  onReset: () => void
}

export default function FileLink({ fileUrl, onReset }: FileLinkProps) {
  const fullUrl = `${window.location.origin}${fileUrl}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl)
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">File uploaded successfully!</h3>
        <p className="text-sm break-all">{fullUrl}</p>
        <div className="flex gap-2">
          <Button onClick={copyToClipboard}>Copy Link</Button>
          <Button variant="outline" onClick={onReset}>Upload Another</Button>
        </div>
      </div>
    </Card>
  )
}