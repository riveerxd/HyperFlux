import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'

const prisma = new PrismaClient()

const uploadDir = process.env.UPLOAD_DIR || './uploads'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024 * 1024 * 2) { // 10GB
      return NextResponse.json(
        { error: 'File size must be less than 5GB' }, 
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const absoluteUploadDir = join(process.cwd(), uploadDir)
    await mkdir(absoluteUploadDir, { recursive: true })

    const uniqueId = uuidv4()
    const fileName = `${uniqueId}-${file.name}`
    const filePath = join(absoluteUploadDir, fileName)

    await writeFile(filePath, buffer)

    const tempFile = await prisma.tempFile.create({
      data: {
        id: uniqueId,
        filename: file.name,
        path: filePath,
        userId: user.id
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ 
      file: {
        id: tempFile.id,
        filename: tempFile.filename,
        createdAt: tempFile.createdAt.toISOString(),
        downloads: 0,
        user: {
          email: tempFile.user.email,
          name: tempFile.user.name
        }
      },
      fileUrl: `/api/files/${tempFile.id}`,
      message: 'File uploaded successfully' 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: (error as Error).message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}