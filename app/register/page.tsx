'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      console.log('Sending registration data:', { email, password, name })

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        cache: 'no-store',
        credentials: 'same-origin',
      })

      console.log('Response status:', res.status)

      if (!res.ok) {
        const text = await res.text()
        console.log('Error response:', text)
        throw new Error(text)
      }

      const data = await res.json()
      console.log('Success response:', data)

      if (data.error) {
        setError(data.error)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
} 