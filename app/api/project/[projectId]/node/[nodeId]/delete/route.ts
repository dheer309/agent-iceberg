import { NextResponse } from 'next/server'
import { mockProjectsStore } from '@/lib/mock-projects'
import { getDeletedNodes } from '@/lib/node-state-store'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  const { projectId, nodeId } = await params
  
  console.log('[v0] Deleting node:', { projectId, nodeId })

  // Get project from store
  const project = mockProjectsStore[projectId]
  if (!project || !project.sessionID) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  // Add node to deleted set
  const deletedNodes = getDeletedNodes(projectId)
  deletedNodes.add(nodeId)
  
  return NextResponse.json({ success: true, message: 'Node deleted successfully' })
}
