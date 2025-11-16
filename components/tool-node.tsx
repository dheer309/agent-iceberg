'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Wrench } from 'lucide-react'

export const ToolNode = memo(({ data, selected }: NodeProps) => {
  const isDisabled = data.disabled === true
  const isRegenerating = data.isRegenerating === true
  
  // Determine border class based on state
  let borderClass = 'border-border'
  if (isRegenerating) {
    borderClass = 'node-regenerating-fade'
  } else if (selected) {
    borderClass = 'border-green-500 glow-blue'
  }
  
  // Determine text class based on disabled state
  const textClass = isDisabled ? 'node-disabled' : ''
  
  return (
    <div
      className={`rounded-lg border bg-card p-4 shadow-lg transition-all ${borderClass} ${textClass}`}
      style={{ minWidth: 200 }}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-green-500" />
      
      <div className={`mb-2 flex items-center gap-2 ${textClass}`}>
        <div className="rounded-full bg-green-500 p-2">
          <Wrench className="h-4 w-4 text-white" />
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wide text-green-500 ${textClass}`}>
          Tool Call
        </span>
      </div>
      
      <div className={`text-sm font-medium ${textClass}`}>{data.label}</div>
      {data.description && (
        <div className={`mt-2 text-xs text-muted-foreground ${textClass}`}>{data.description}</div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-green-500" />
    </div>
  )
})

ToolNode.displayName = 'ToolNode'
