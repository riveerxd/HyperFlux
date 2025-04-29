'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { useTheme } from '@/app/providers/theme-provider'
import { Moon, Sun } from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()

  if (status === 'loading') return null
  if (!session) return null

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">File Sharing App</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {session.user?.email}
          </span>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
} 