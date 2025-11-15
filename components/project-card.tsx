'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { GitBranch, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    nodeCount: number
    updatedAt: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()

  return (
    <Card
      className="group cursor-pointer transition-all hover:border-primary/50 hover:glow-subtle"
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <CardHeader>
        <CardTitle className="text-lg group-hover:text-primary">{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span>{project.nodeCount} nodes</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
