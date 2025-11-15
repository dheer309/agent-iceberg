import { NextResponse } from 'next/server'
import { mockProjectsStore } from '@/lib/mock-projects'
import { promises as fs } from 'fs'
import path from 'path'

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Get project from shared store
  const project = mockProjectsStore[id]
  
  if (project) {
    return NextResponse.json(project)
  }
  
  // Fallback for newly created projects not yet in store
  return NextResponse.json(
    { id, name: 'New Analysis', nodeCount: 0, updatedAt: new Date().toISOString(), response: '', userPrompt: '' },
    { status: 200 }
  )
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: any = {}
  try {
    const text = await request.text()
    if (text) {
      body = JSON.parse(text)
    }
  } catch (error) {
    // If JSON parsing fails, return error
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    )
  }
  
  // Get project from shared store
  const project = mockProjectsStore[id]
  
  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }
  
  // Update project with userPrompt if provided
  if (body.userPrompt !== undefined) {
    project.userPrompt = body.userPrompt
    project.updatedAt = new Date().toISOString()
    
    // Update in shared store
    mockProjectsStore[id] = project
    
    // Write to mock-projects.ts file
    try {
      const filePath = path.join(process.cwd(), 'lib', 'mock-projects.ts')
      const fileContent = await fs.readFile(filePath, 'utf-8')
      
      // Find the project entry in the file
      const projectKeyPattern = `"${id}"`
      const keyIndex = fileContent.indexOf(projectKeyPattern)
      
      if (keyIndex !== -1) {
        // Find the opening brace after the key
        const openBraceIndex = fileContent.indexOf('{', keyIndex)
        if (openBraceIndex !== -1) {
          // Find the matching closing brace by counting braces
          let braceCount = 0
          let closeBraceIndex = openBraceIndex
          for (let i = openBraceIndex; i < fileContent.length; i++) {
            if (fileContent[i] === '{') braceCount++
            if (fileContent[i] === '}') {
              braceCount--
              if (braceCount === 0) {
                closeBraceIndex = i
                break
              }
            }
          }
          
          // Extract the project entry (object content only, without the key)
          const projectEntry = fileContent.substring(openBraceIndex + 1, closeBraceIndex)
          
          // Replace or add userPrompt in the project entry
          const escapedPrompt = body.userPrompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
          let updatedProjectEntry: string
          
          if (projectEntry.includes('userPrompt:')) {
            // Replace existing userPrompt
            updatedProjectEntry = projectEntry.replace(
              /userPrompt:\s*"[^"]*"/,
              `userPrompt: "${escapedPrompt}"`
            )
          } else {
            // Add userPrompt before the closing brace
            // Find the last property before the closing brace
            const trimmedEntry = projectEntry.trim()
            const lastNewlineIndex = trimmedEntry.lastIndexOf('\n')
            if (lastNewlineIndex !== -1) {
              // Insert userPrompt after the last property with proper indentation
              const lastLine = trimmedEntry.substring(lastNewlineIndex + 1)
              const indentMatch = lastLine.match(/^(\s+)/)
              const indent = indentMatch ? indentMatch[1] : '    '
              updatedProjectEntry = projectEntry.trimEnd() + `,\n${indent}userPrompt: "${escapedPrompt}",`
            } else {
              // Fallback: insert before closing brace
              updatedProjectEntry = projectEntry + `\n    userPrompt: "${escapedPrompt}",`
            }
          }
          
          // Replace the old entry with the updated one
          const newContent = 
            fileContent.substring(0, openBraceIndex + 1) +
            updatedProjectEntry +
            fileContent.substring(closeBraceIndex)
          
          await fs.writeFile(filePath, newContent, 'utf-8')
        }
      }
    } catch (error) {
      console.error('Failed to write to mock-projects.ts:', error)
      // Continue even if file write fails
    }
  }
  
  return NextResponse.json(project)
}

