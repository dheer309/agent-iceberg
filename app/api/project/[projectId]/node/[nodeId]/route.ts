import { NextResponse } from 'next/server'

// Mock node details
const mockNodeDetails = {
  id: '1',
  type: 'model',
  label: 'Parse User Query',
  description: 'Extract intent and entities',
  explanation: 'This step analyzes the incoming user query to understand what the user is asking for. It uses natural language processing to identify key entities (like product names, dates, or customer IDs) and the overall intent of the request.',
  metadata: {
    model: 'gpt-4.1',
    stepId: 'step_abc123',
    prompt: 'Extract entities and intent from the following query:\n\n"I need help with my order from last week"',
  },
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  const { projectId, nodeId } = await params
  console.log('[v0] Fetching node details:', { projectId, nodeId })
  
  return NextResponse.json(mockNodeDetails)
}
