import { NextResponse } from 'next/server'
import { mockProjectsStore } from '@/lib/mock-projects'

export async function GET() {
  const projects = Object.values(mockProjectsStore)
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newProject = {
    id: String(Date.now()),
    name: body.name || 'New Analysis',
    nodeCount: 0,
    updatedAt: new Date().toISOString(),
    response: '',
  }
  
  // Store the new project in the shared store
  mockProjectsStore[newProject.id] = newProject
  
  return NextResponse.json(newProject)
}
