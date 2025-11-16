'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Brain } from 'lucide-react'

export const ModelNode = memo(({ data, selected }: NodeProps) => {
  const isDisabled = data.disabled === true
  const isRegenerating = data.isRegenerating === true
  
  // Determine border class based on state
  let borderClass = 'border-border'
  if (isRegenerating) {
    borderClass = 'node-regenerating-fade'
  } else if (selected) {
    borderClass = 'border-blue-500 glow-blue'
  }
  
  // Determine text class based on disabled state
  const textClass = isDisabled ? 'node-disabled' : ''
  
  return (
    <div
      className={`rounded-lg border bg-card p-4 shadow-lg transition-all ${borderClass} ${textClass}`}
      style={{ width: 200 }}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-blue-500" />
      
      <div className={`mb-2 flex items-center gap-2 ${textClass}`}>
        <div className="rounded-full bg-blue-500 p-2">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wide text-blue-500 ${textClass}`}>
          Model Step
        </span>
      </div>
      
      <div className={`text-sm font-medium ${textClass}`}>{data.label}</div>
      {data.description && (
        <div className={`mt-2 text-xs text-muted-foreground ${textClass}`}>{data.description}</div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-blue-500" />
    </div>
  )
})

ModelNode.displayName = 'ModelNode'
