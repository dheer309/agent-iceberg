'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Undo2, Redo2, History, Download, Menu } from 'lucide-react'

interface TopNavProps {
  projectId: string
}

export function TopNav({ projectId }: TopNavProps) {
  const router = useRouter()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-lg font-semibold">Customer Query Analysis</h1>
          <p className="text-xs text-muted-foreground">Project ID: {projectId}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled>
          <Undo2 className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" disabled>
          <Redo2 className="h-5 w-5" />
        </Button>
        
        <div className="mx-2 h-6 w-px bg-border" />
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push(`/project/${projectId}/history`)}
        >
          <History className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon">
          <Download className="h-5 w-5" />
        </Button>
        
        <div className="mx-2 h-6 w-px bg-border" />
        
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
