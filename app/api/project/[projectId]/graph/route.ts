import { NextResponse } from "next/server";
import { graphPayload } from "@/lib/payloads/graph-payload";
import { mockProjectsStore } from "@/lib/mock-projects";
import { getDisabledNodes, getDeletedNodes } from "@/lib/node-state-store";
import dagre from "dagre";

// Map pipeline_graph node kind to ReactFlow node type
function mapNodeType(kind: string): string {
  switch (kind) {
    case "agent":
      return "model";
    case "tool":
      return "tool";
    case "decision":
      return "user";
    default:
      return "model";
  }
}

// Generate vertical layout positions using dagre
function generatePositions(
  nodes: Array<{ id: string }>,
  edges: Array<{ source: string; target: string }>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  if (nodes.length === 0) {
    return positions;
  }

  // Create a new directed graph
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "TB", // Top to bottom (vertical layout)
    nodesep: 100, // Horizontal spacing between nodes
    ranksep: 80, // Vertical spacing between ranks
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph with estimated dimensions
  // ReactFlow nodes are typically around 200-250px wide and 100-150px tall
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 120;

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run dagre layout algorithm
  dagre.layout(g);

  // Extract positions from dagre and map to ReactFlow format
  g.nodes().forEach((nodeId) => {
    const node = g.node(nodeId);
    // Dagre positions are centered, ReactFlow uses top-left corner
    positions.set(nodeId, {
      x: node.x - NODE_WIDTH / 2,
      y: node.y - NODE_HEIGHT / 2,
    });
  });

  return positions;
}

// Transform pipeline_graph to ReactFlow format
function transformGraph(
  pipelineGraph: any,
  disabledNodes: Set<string>,
  deletedNodes: Set<string>
) {
  if (!pipelineGraph || !pipelineGraph.nodes || !pipelineGraph.edges) {
    return { nodes: [], edges: [] };
  }

  const { nodes: pipelineNodes, edges: pipelineEdges } = pipelineGraph;

  // Filter out deleted nodes
  const activeNodes = pipelineNodes.filter(
    (node: any) => !deletedNodes.has(node.id)
  );

  // Filter edges to only include edges between active nodes
  const activeNodeIds = new Set(activeNodes.map((n: any) => n.id));
  const activeEdges = pipelineEdges.filter(
    (edge: any) =>
      activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target)
  );

  const positions = generatePositions(activeNodes, activeEdges);

  // Transform nodes
  const nodes = activeNodes.map((node: any) => {
    const position = positions.get(node.id) || { x: 0, y: 0 };
    return {
      id: node.id,
      type: mapNodeType(node.kind || "agent"),
      position,
      data: {
        label: node.label || node.id,
        description: node.description || "",
        disabled: disabledNodes.has(node.id),
      },
    };
  });

  // Transform edges
  const edges = activeEdges.map((edge: any) => ({
    id: `e${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    animated: false,
    label: edge.label || "",
  }));

  return { nodes, edges };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  console.log("[v0] Fetching graph for project:", projectId);

  // Get project from store
  const project = mockProjectsStore[projectId];
  if (!project || !project.sessionID) {
    return NextResponse.json({
      nodes: [],
      edges: [],
      metadata: {
        totalNodes: 0,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  // Find matching payload entry by session_id
  const payloadEntry = graphPayload.find(
    (entry: any) => entry.session_id === project.sessionID
  );

  // Type guard: check if payloadEntry has pipeline_graph property
  if (
    !payloadEntry ||
    !("pipeline_graph" in payloadEntry) ||
    !payloadEntry.pipeline_graph
  ) {
    return NextResponse.json({
      nodes: [],
      edges: [],
      metadata: {
        totalNodes: 0,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  // Get disabled and deleted nodes for this project
  const disabledNodes = getDisabledNodes(projectId);
  const deletedNodes = getDeletedNodes(projectId);

  // Transform pipeline_graph to ReactFlow format
  const { nodes, edges } = transformGraph(
    payloadEntry.pipeline_graph,
    disabledNodes,
    deletedNodes
  );

  return NextResponse.json({
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      lastUpdated: new Date().toISOString(),
    },
  });
}
