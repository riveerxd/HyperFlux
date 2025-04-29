import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  console.log('Register API route hit')
  
  try {
    // Test database connection
    try {
      await prisma.$connect()
      console.log('Database connected successfully')
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const { email, password, name } = await request.json()
    console.log('Processing registration for:', { email, name })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Log the user creation attempt
    console.log('Attempting to create user with:', {
      email,
      name,
      passwordLength: password.length
    })

    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('Password hashed successfully')

    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      })
      console.log('User created successfully:', { id: user.id, email: user.email })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      })
    } catch (createError) {
      console.error('User creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 