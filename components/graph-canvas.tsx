"use client";

import { useCallback, useEffect, useState } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import { ModelNode } from "@/components/model-node";
import { ToolNode } from "@/components/tool-node";
import { BranchNode } from "@/components/branch-node";
import { UserNode } from "@/components/user-node";

const nodeTypes: NodeTypes = {
  model: ModelNode,
  tool: ToolNode,
  branch: BranchNode,
  user: UserNode,
};

interface Project {
  id: string;
  name: string;
  nodeCount: number;
  updatedAt: string;
}

interface GraphCanvasProps {
  projectId: string;
  onNodeSelect: (nodeId: string) => void;
}

export function GraphCanvas({ projectId, onNodeSelect }: GraphCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  const fetchGraph = useCallback(async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/graph`);
      if (response.ok) {
        const data = await response.json();
        // Preserve regenerating state when refreshing
        setNodes((currentNodes) => {
          const regeneratingNodes = new Map(
            currentNodes
              .filter((n) => n.data.isRegenerating)
              .map((n) => [n.id, true])
          );
          
          return data.nodes.map((node: any) => {
            if (regeneratingNodes.has(node.id)) {
              return {
                ...node,
                data: {
                  ...node.data,
                  isRegenerating: true,
                },
              };
            }
            return node;
          });
        });
        setEdges(data.edges);
      }
    } catch (error) {
      console.error("[v0] Failed to fetch graph:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, setNodes, setEdges]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Listen for refresh events from RightPanel
  useEffect(() => {
    const handleRefresh = () => {
      fetchGraph();
    };

    window.addEventListener('graph-refresh', handleRefresh);
    return () => {
      window.removeEventListener('graph-refresh', handleRefresh);
    };
  }, [fetchGraph]);

  // Method to trigger regeneration animation on a node
  const triggerRegenerationAnimation = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              isRegenerating: true,
            },
          };
        }
        return node;
      })
    );

    // Remove animation after 3 seconds
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                isRegenerating: false,
              },
            };
          }
          return node;
        })
      );
    }, 3000);
  }, [setNodes]);

  // Listen for regeneration animation events
  useEffect(() => {
    const handleRegenerate = (event: CustomEvent<{ nodeId: string }>) => {
      triggerRegenerationAnimation(event.detail.nodeId);
    };

    window.addEventListener('node-regenerate', handleRegenerate as EventListener);
    return () => {
      window.removeEventListener('node-regenerate', handleRegenerate as EventListener);
    };
  }, [triggerRegenerationAnimation]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading graph...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Project Name Display - Main Panel Header */}
      {project && (
        <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {project.name}
          </h2>
        </div>
      )}

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
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
        }}
      >
        <Background color="#27272a" gap={16} />
        <Controls className="rounded-lg border border-border bg-card" />
      </ReactFlow>
    </div>
  );
}
