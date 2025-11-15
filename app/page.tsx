import { Hero } from '@/components/hero'
import { ProjectGrid } from '@/components/project-grid'
import { NodeLegend } from '@/components/node-legend'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Hero />
        <NodeLegend />
        <ProjectGrid />
      </div>
    </div>
  )
}
