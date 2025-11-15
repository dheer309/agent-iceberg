import { NextResponse } from 'next/server'
import { mockProjectsStore } from '@/lib/mock-projects'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Get project from shared store
  const project = mockProjectsStore[id]
  
  if (project) {
    return NextResponse.json(project)
  }
  
  // Fallback for newly created projects not yet in store
  return NextResponse.json(
    { id, name: 'New Analysis', nodeCount: 0, updatedAt: new Date().toISOString(), response: '' },
    { status: 200 }
  )
}

