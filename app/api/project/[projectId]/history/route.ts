import { NextResponse } from 'next/server'

// Mock history data
const mockHistory = [
  {
    id: 'v4',
    type: 'modify',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    description: 'Modified "Parse User Query" node with custom instruction',
    nodeCount: 24,
  },
  {
    id: 'v3',
    type: 'delete',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    description: 'Deleted redundant tool call node',
    nodeCount: 25,
  },
  {
    id: 'v2',
    type: 'branch',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    description: 'Created new branch from decision point',
    nodeCount: 26,
  },
  {
    id: 'v1',
    type: 'create',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    description: 'Initial project creation',
    nodeCount: 18,
  },
]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  console.log('[v0] Fetching history for project:', projectId)
  
  return NextResponse.json(mockHistory)
}
