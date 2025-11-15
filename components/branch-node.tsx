'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { GitBranch } from 'lucide-react'

export const BranchNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`rounded-lg border bg-card p-4 shadow-lg transition-all ${
        selected ? 'border-orange-500 glow-blue' : 'border-border'
      }`}
      style={{ minWidth: 200 }}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-orange-500" />
      
      <div className="mb-2 flex items-center gap-2">
        <div className="rounded-full bg-orange-500 p-2">
          <GitBranch className="h-4 w-4 text-white" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">
          Branch
        </span>
      </div>
      
      <div className="text-sm font-medium">{data.label}</div>
      {data.description && (
        <div className="mt-2 text-xs text-muted-foreground">{data.description}</div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-orange-500" />
    </div>
  )
})

BranchNode.displayName = 'BranchNode'
