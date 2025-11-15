'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, GitCommit, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface HistoryEntry {
  id: string
  type: 'create' | 'modify' | 'delete' | 'branch'
  timestamp: string
  description: string
  nodeCount: number
}

interface HistoryTimelineProps {
  projectId: string
}

export function HistoryTimeline({ projectId }: HistoryTimelineProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/history`)
        if (response.ok) {
          const data = await response.json()
          setHistory(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [projectId])

  const handleRestore = async (versionId: string) => {
    try {
      const response = await fetch(`/api/project/${projectId}/history/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      })

      if (response.ok) {
        window.location.href = `/project/${projectId}`
      }
    } catch (error) {
      console.error('[v0] Failed to restore version:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'modify':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'delete':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'branch':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-6">
        {history.map((entry, index) => (
          <div key={entry.id} className="relative pl-12">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-6 h-3 w-3 rounded-full border-2 border-primary bg-background" />

            <Card className="transition-all hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(entry.type)}>
                        {entry.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="mb-2 font-medium">{entry.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GitCommit className="h-4 w-4" />
                      <span>{entry.nodeCount} nodes</span>
                    </div>
                  </div>

                  {index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(entry.id)}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
