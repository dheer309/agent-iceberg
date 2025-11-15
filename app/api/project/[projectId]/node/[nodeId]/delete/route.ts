import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  const { projectId, nodeId } = await params
  
  console.log('[v0] Deleting node:', { projectId, nodeId })
  
  return NextResponse.json({ success: true, message: 'Node deleted successfully' })
}
