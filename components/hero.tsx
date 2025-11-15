'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Plus, Sparkles } from 'lucide-react'

export function Hero() {
  const router = useRouter()

  const handleCreateProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Analysis' }),
      })
      
      if (response.ok) {
        const project = await response.json()
        router.push(`/project/${project.id}`)
      }
    } catch (error) {
      console.error('[v0] Failed to create project:', error)
    }
  }

  return (
    <section className="mb-16 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">Observable AI</span>
      </div>
      
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
        See How AI{' '}
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Thinks
        </span>
      </h1>
      
      <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground text-pretty">
        Visualize your AI model&apos;s reasoning process. Click any step to inspect, modify, 
        or regenerate parts of the decision tree.
      </p>
      
      <Button 
        size="lg" 
        onClick={handleCreateProject}
        className="group gap-2 bg-primary hover:bg-primary/90 glow-purple"
      >
        <Plus className="h-5 w-5" />
        Create New Analysis
      </Button>
      
      <p className="mt-4 text-sm text-muted-foreground">
        Built for non-technical users — business analysts, teachers, and healthcare professionals
      </p>
    </section>
  )
}
