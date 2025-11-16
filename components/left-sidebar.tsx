'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, X, Brain, Wrench, GitBranch, PencilLine } from 'lucide-react'

interface LeftSidebarProps {
  onClose: () => void
}

export function LeftSidebar({ onClose }: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    model: true,
    tool: true,
    branch: true,
    user: true,
  })

  return (
    <aside className="w-80 border-r border-border bg-black p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters & Search</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Label htmlFor="search" className="mb-2 text-sm">
          Search Nodes
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by label or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Node Type Filters */}
      <div className="mb-6">
        <Label className="mb-3 text-sm">Node Types</Label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="model"
              checked={filters.model}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, model: checked as boolean })
              }
            />
            <Label htmlFor="model" className="flex items-center gap-2 cursor-pointer">
              <Brain className="h-4 w-4 text-blue-500" />
              <span>Model Steps</span>
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="tool"
              checked={filters.tool}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, tool: checked as boolean })
              }
            />
            <Label htmlFor="tool" className="flex items-center gap-2 cursor-pointer">
              <Wrench className="h-4 w-4 text-green-500" />
              <span>Tool Calls</span>
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="branch"
              checked={filters.branch}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, branch: checked as boolean })
              }
            />
            <Label htmlFor="branch" className="flex items-center gap-2 cursor-pointer">
              <GitBranch className="h-4 w-4 text-orange-500" />
              <span>Branches</span>
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="user"
              checked={filters.user}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, user: checked as boolean })
              }
            />
            <Label htmlFor="user" className="flex items-center gap-2 cursor-pointer">
              <PencilLine className="h-4 w-4 text-purple-500" />
              <span>User Edits</span>
            </Label>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="mb-3 text-sm font-semibold">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Model decision</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">External tool</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Decision point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Manual intervention</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
