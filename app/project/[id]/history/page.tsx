import { HistoryTimeline } from '@/components/history-timeline'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/project/${id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Version History</h1>
              <p className="text-sm text-muted-foreground">
                Track changes and restore previous versions
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-5xl px-4 py-8">
        <HistoryTimeline projectId={id} />
      </div>
    </div>
  )
}
