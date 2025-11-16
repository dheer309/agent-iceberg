"use client"

import { motion } from "framer-motion"
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import { ModelNode } from "@/components/model-node"
import { ToolNode } from "@/components/tool-node"
import { BranchNode } from "@/components/branch-node"
import { UserNode } from "@/components/user-node"
import { staggerContainer, childVariants, viewportConfig } from "@/lib/animations"

const nodeTypes: NodeTypes = {
  model: ModelNode,
  tool: ToolNode,
  branch: BranchNode,
  user: UserNode,
}

// Sample data for the preview
const initialNodes: Node[] = [
  {
    id: "1",
    type: "model",
    position: { x: 250, y: 0 },
    data: { label: "Analyze user query", description: "Understanding intent" },
  },
  {
    id: "2",
    type: "tool",
    position: { x: 100, y: 150 },
    data: { label: "Search database", description: "Fetching data" },
  },
  {
    id: "3",
    type: "branch",
    position: { x: 400, y: 150 },
    data: { label: "Decision point", description: "Choose path" },
  },
  {
    id: "4",
    type: "model",
    position: { x: 250, y: 300 },
    data: { label: "Generate response", description: "Final output" },
  },
  {
    id: "5",
    type: "user",
    position: { x: 100, y: 450 },
    data: { label: "User edit", description: "Modified step" },
  },
]

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
]

export function InteractivePreviewSection() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  return (
    <section className="relative bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.div
            variants={childVariants}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Interactive{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Workspace
              </span>
            </h2>
          </motion.div>

          <motion.p
            variants={childVariants}
            className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground"
          >
            Explore a live preview of the platform. Click nodes to inspect, modify, and see how
            changes propagate through the graph.
          </motion.p>

          <motion.div
            variants={childVariants}
            className="relative"
          >
          {/* Animated border with glow */}
          <div className="relative rounded-lg border-2 border-primary/50 bg-card p-1 shadow-2xl shadow-primary/20">
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-50 blur-xl" />

            {/* ReactFlow container */}
            <div className="relative h-[600px] w-full rounded-lg bg-background">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="bg-background"
                defaultEdgeOptions={{
                  type: "smoothstep",
                  markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
                  style: { stroke: "#8b5cf6", strokeWidth: 2 },
                }}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
              >
                <Background color="#27272a" gap={16} />
                <Controls className="rounded-lg border border-border bg-card" />
              </ReactFlow>

              {/* Label overlays */}
              <div className="absolute left-4 top-4 rounded-lg border border-primary/30 bg-black/60 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
                Nodes
              </div>
              <div className="absolute right-4 top-4 rounded-lg border border-secondary/30 bg-black/60 px-3 py-1.5 text-xs font-medium text-secondary backdrop-blur-sm">
                Inspector Panel
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-primary/30 bg-black/60 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
                User Edits Here
              </div>
            </div>
          </div>

          {/* Outer glow effect */}
          <div className="absolute -inset-4 -z-10 rounded-lg bg-primary/10 blur-2xl" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

