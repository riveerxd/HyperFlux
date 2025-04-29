import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/auth'

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.fileLink.delete({
      where: { id: params.linkId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 