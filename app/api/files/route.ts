import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        files: [],
        isAdmin: false,
        error: 'Unauthorized' 
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ 
        files: [],
        isAdmin: false,
        error: 'User not found' 
      })
    }

    const isAdmin = user.role === 'ADMIN'
    
    const files = await prisma.tempFile.findMany({
      where: isAdmin ? undefined : { userId: user.id },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const serializedFiles = files.map(file => ({
      ...file,
      createdAt: file.createdAt.toISOString(),
    }))

    return NextResponse.json({
      files: serializedFiles,
      isAdmin
    })

  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({
      files: [],
      isAdmin: false,
      error: 'Failed to fetch files'
    })
  } finally {
    await prisma.$disconnect()
  }
} 