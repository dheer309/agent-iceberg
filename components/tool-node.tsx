'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Wrench } from 'lucide-react'

export const ToolNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`rounded-lg border bg-card p-4 shadow-lg transition-all ${
        selected ? 'border-green-500 glow-blue' : 'border-border'
      }`}
      style={{ minWidth: 200 }}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-green-500" />
      
      <div className="mb-2 flex items-center gap-2">
        <div className="rounded-full bg-green-500 p-2">
          <Wrench className="h-4 w-4 text-white" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-green-500">
          Tool Call
        </span>
      </div>
      
      <div className="text-sm font-medium">{data.label}</div>
      {data.description && (
        <div className="mt-2 text-xs text-muted-foreground">{data.description}</div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-green-500" />
    </div>
  )
})

ToolNode.displayName = 'ToolNode'
