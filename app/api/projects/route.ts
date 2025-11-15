import { NextResponse } from 'next/server'

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    name: 'Customer Query Analysis',
    nodeCount: 24,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '2',
    name: 'Medical Diagnosis Review',
    nodeCount: 18,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '3',
    name: 'Code Analysis Trace',
    nodeCount: 42,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(mockProjects)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newProject = {
    id: String(Date.now()),
    name: body.name || 'New Analysis',
    nodeCount: 0,
    updatedAt: new Date().toISOString(),
  }
  
  return NextResponse.json(newProject)
}
