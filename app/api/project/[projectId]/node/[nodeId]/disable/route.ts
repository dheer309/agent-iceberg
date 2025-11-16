import { NextResponse } from 'next/server'
import { graphPayload } from '@/lib/payloads/graph-payload'
import { mockProjectsStore } from '@/lib/mock-projects'
import { getDisabledNodes } from '@/lib/node-state-store'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  const { projectId, nodeId } = await params
  
  console.log('[v0] Toggling disable state for node:', { projectId, nodeId })

  // Get project from store
  const project = mockProjectsStore[projectId]
  if (!project || !project.sessionID) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  // Find matching payload entry by session_id
  const payloadEntry = graphPayload.find(
    (entry: any) => entry.session_id === project.sessionID
  )

  if (
    !payloadEntry ||
    !('pipeline_graph' in payloadEntry) ||
    !payloadEntry.pipeline_graph ||
    !payloadEntry.pipeline_graph.nodes
  ) {
    return NextResponse.json(
      { error: 'Pipeline graph not found' },
      { status: 404 }
    )
  }

  // Check if node exists
  const node = payloadEntry.pipeline_graph.nodes.find(
    (n: any) => n.id === nodeId
  )

  if (!node) {
    return NextResponse.json(
      { error: 'Node not found' },
      { status: 404 }
    )
  }

  // Toggle disabled state
  const disabledNodes = getDisabledNodes(projectId)
  const isCurrentlyDisabled = disabledNodes.has(nodeId)
  
  if (isCurrentlyDisabled) {
    disabledNodes.delete(nodeId)
  } else {
    disabledNodes.add(nodeId)
  }

  return NextResponse.json({ 
    success: true, 
    disabled: !isCurrentlyDisabled,
    message: `Node ${!isCurrentlyDisabled ? 'disabled' : 'enabled'} successfully` 
  })
}

