'use client'

import { useEffect, useState } from 'react'
import { ProjectCard } from '@/components/project-card'
import { Loader2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  nodeCount: number
  updatedAt: string
}

export function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-lg text-muted-foreground">
          No projects yet. Create your first analysis to get started.
        </p>
      </div>
    )
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold">Your Projects</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
