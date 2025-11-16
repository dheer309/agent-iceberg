'use client'

import { useState } from 'react'
import { GraphCanvas } from '@/components/graph-canvas'
import { TopNav } from '@/components/top-nav'
import { LeftSidebar } from '@/components/left-sidebar'
import { RightPanel } from '@/components/right-panel'

interface ProjectWorkspaceProps {
  projectId: string
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen flex-col bg-background pt-16">
      <TopNav projectId={projectId} />
      
      <div className="flex flex-1 overflow-hidden">
        {leftSidebarOpen && (
          <LeftSidebar projectId={projectId} onClose={() => setLeftSidebarOpen(false)} />
        )}
        
        <main className="flex-1 overflow-hidden">
          <GraphCanvas 
            projectId={projectId} 
            onNodeSelect={setSelectedNodeId}
          />
        </main>
        
        {selectedNodeId && (
          <RightPanel 
            key={selectedNodeId}
            projectId={projectId}
            nodeId={selectedNodeId}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  )
}
