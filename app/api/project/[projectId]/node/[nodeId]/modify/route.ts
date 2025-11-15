import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  const { projectId, nodeId } = await params
  const body = await request.json()
  
  console.log('[v0] Modifying node:', { projectId, nodeId, instruction: body.editInstruction })
  
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000))
  
  return NextResponse.json({ success: true, message: 'Node modified successfully' })
}
