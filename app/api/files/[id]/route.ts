import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { join } from 'path'
import { stat, readFile, unlink } from 'fs/promises'

const prisma = new PrismaClient()

const uploadDir = process.env.UPLOAD_DIR || './uploads'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if this is a shared link access
    const url = new URL(request.url)
    const linkId = url.searchParams.get('linkId')

    if (!linkId) {
      // Regular download - require authentication
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Shared link download - verify link validity
      const link = await prisma.fileLink.findUnique({
        where: { id: linkId }
      })

      if (!link || link.fileId !== params.id || new Date() > new Date(link.expiresAt)) {
        return NextResponse.json({ error: 'Invalid or expired link' }, { status: 403 })
      }

      // Increment download count for the link
      await prisma.fileLink.update({
        where: { id: linkId },
        data: { downloads: { increment: 1 } }
      })
    }

    const file = await prisma.tempFile.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Rest of your existing file download logic
    const fileName = `${file.id}-${file.filename}`
    const filePath = join(process.cwd(), uploadDir, fileName)

    const stats = await stat(filePath)
    const fileBuffer = await readFile(filePath)

    // Increment download count for the file
    await prisma.tempFile.update({
      where: { id: file.id },
      data: { downloads: { increment: 1 } }
    })

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Content-Length': stats.size.toString()
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    const file = await prisma.tempFile.findUnique({
      where: { id: params.id }
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    if (user?.role !== 'ADMIN' && file.userId !== user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete from database first
    await prisma.tempFile.delete({
      where: { id: params.id }
    })

    // Then try to delete the physical file
    try {
      const fileName = `${file.id}-${file.filename}`
      const filePath = join(process.cwd(), uploadDir, fileName)
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting file from disk:', error)
      // Continue even if physical file deletion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 