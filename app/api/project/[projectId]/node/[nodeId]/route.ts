import { NextResponse } from 'next/server'
import { graphPayload } from '@/lib/payloads/graph-payload'
import { mockProjectsStore } from '@/lib/mock-projects'

// Map pipeline_graph node kind to ReactFlow node type
function mapNodeType(kind: string): string {
  switch (kind) {
    case 'agent':
      return 'model'
    case 'tool':
      return 'tool'
    case 'decision':
      return 'user'
    default:
      return 'model'
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  const { projectId, nodeId } = await params
  console.log('[v0] Fetching node details:', { projectId, nodeId })

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

  // Type guard: check if payloadEntry has pipeline_graph property
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

  // Find the specific node by nodeId
  const node = payloadEntry.pipeline_graph.nodes.find(
    (n: any) => n.id === nodeId
  )

  if (!node) {
    return NextResponse.json(
      { error: 'Node not found' },
      { status: 404 }
    )
  }

  // Get completed_nodes data if available, using node.id from pipeline_graph.nodes
  const completedNodes = payloadEntry.completed_nodes || {}
  const completedNodeData = completedNodes[node.id]

  // Map toolInput from completed_nodes
  let toolInput: string | undefined
  if (completedNodeData) {
    if (completedNodeData.request_params) {
      toolInput = JSON.stringify(completedNodeData.request_params, null, 2)
    } else if (completedNodeData.query) {
      toolInput = JSON.stringify({ query: completedNodeData.query }, null, 2)
    }
  }

  // Map toolOutput from completed_nodes
  let toolOutput: string | undefined
  if (completedNodeData && completedNodeData.results) {
    toolOutput = JSON.stringify(completedNodeData.results, null, 2)
  }

  // Map node data to NodeDetails interface
  const nodeDetails = {
    id: node.id,
    type: mapNodeType(node.kind || 'agent'),
    label: node.label || node.id,
    description: node.description || '',
    explanation: node.description || '',
    metadata: {
      stepId: node.id,
      toolInput,
      toolOutput,
    },
  }

  return NextResponse.json(nodeDetails)
}
