import { NextResponse } from 'next/server'
import { graphPayload } from '@/lib/payloads/graph-payload'
import { mockProjectsStore } from '@/lib/mock-projects'
import { getDeletedNodes } from '@/lib/node-state-store'

// Find all descendant nodes (children and their children recursively)
function findDescendantNodes(
  nodeId: string,
  edges: Array<{ source: string; target: string }>
): Set<string> {
  const descendants = new Set<string>()
  const visited = new Set<string>()
  
  function traverse(currentNodeId: string) {
    if (visited.has(currentNodeId)) return
    visited.add(currentNodeId)
    
    // Find all direct children
    const children = edges
      .filter(edge => edge.source === currentNodeId)
      .map(edge => edge.target)
    
    for (const childId of children) {
      descendants.add(childId)
      traverse(childId) // Recursively find grandchildren
    }
  }
  
  traverse(nodeId)
  return descendants
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  const { projectId, nodeId } = await params
  
  console.log('[v0] Regenerating node:', { projectId, nodeId })

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
    !payloadEntry.pipeline_graph.nodes ||
    !payloadEntry.pipeline_graph.edges
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

  // Find all descendant nodes
  const descendantNodes = findDescendantNodes(
    nodeId,
    payloadEntry.pipeline_graph.edges
  )

  // Add descendant nodes to deleted set
  const deletedNodes = getDeletedNodes(projectId)
  descendantNodes.forEach(childId => {
    deletedNodes.add(childId)
  })

  return NextResponse.json({ 
    success: true,
    childNodeIds: Array.from(descendantNodes),
    message: `Node marked for regeneration. ${descendantNodes.size} child node(s) removed.`
  })
}

