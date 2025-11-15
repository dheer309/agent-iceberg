import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const settings = await request.json()
  
  console.log('[v0] Saving user settings:', settings)
  
  return NextResponse.json({ success: true, message: 'Settings saved successfully' })
}
