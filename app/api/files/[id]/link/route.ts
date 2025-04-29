import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/auth'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const hours = body.hours

    if (!hours || hours < 1 || hours > 720) {
      return NextResponse.json(
        { error: 'Invalid duration' },
        { status: 400 }
      )
    }

    const link = await prisma.fileLink.create({
      data: {
        id: uuidv4(),
        fileId: params.id,
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({ link: link.id })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 