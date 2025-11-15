'use client'

import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ModelNode } from '@/components/model-node'
import { ToolNode } from '@/components/tool-node'
import { BranchNode } from '@/components/branch-node'
import { UserNode } from '@/components/user-node'

const nodeTypes: NodeTypes = {
  model: ModelNode,
  tool: ToolNode,
  branch: BranchNode,
  user: UserNode,
}

interface GraphCanvasProps {
  projectId: string
  onNodeSelect: (nodeId: string) => void
}

export function GraphCanvas({ projectId, onNodeSelect }: GraphCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/graph`)
        if (response.ok) {
          const data = await response.json()
          setNodes(data.nodes)
          setEdges(data.edges)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch graph:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGraph()
  }, [projectId, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id)
    },
    [onNodeSelect]
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading graph...</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        }}
      >
        <Background color="#27272a" gap={16} />
        <Controls className="rounded-lg border border-border bg-card" />
        <MiniMap
          className="rounded-lg border border-border bg-card"
          nodeColor={(node) => {
            switch (node.type) {
              case 'model':
                return '#3b82f6'
              case 'tool':
                return '#10b981'
              case 'branch':
                return '#f59e0b'
              case 'user':
                return '#8b5cf6'
              default:
                return '#52525b'
            }
          }}
        />
      </ReactFlow>
    </div>
  )
}
