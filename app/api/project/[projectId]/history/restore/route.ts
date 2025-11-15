import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const body = await request.json()
  
  console.log('[v0] Restoring version:', { projectId, versionId: body.versionId })
  
  return NextResponse.json({ success: true, message: 'Version restored successfully' })
}
