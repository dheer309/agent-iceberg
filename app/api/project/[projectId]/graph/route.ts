import { NextResponse } from "next/server";

// Mock graph data for demonstration
const mockGraph = {
  nodes: [
    {
      id: "1",
      type: "model",
      position: { x: 250, y: 0 },
      data: {
        label: "Parse User Query",
        description: "Extract intent and entities",
      },
    },
    {
      id: "2",
      type: "tool",
      position: { x: 100, y: 150 },
      data: { label: "Database Lookup", description: "Query customer records" },
    },
    {
      id: "3",
      type: "model",
      position: { x: 400, y: 150 },
      data: { label: "Context Analysis", description: "Analyze user history" },
    },
    {
      id: "4",
      type: "branch",
      position: { x: 250, y: 300 },
      data: {
        label: "Decision Point",
        description: "Choose response strategy",
      },
    },
    {
      id: "5",
      type: "model",
      position: { x: 100, y: 450 },
      data: {
        label: "Generate Response A",
        description: "Standard response path",
      },
    },
    {
      id: "6",
      type: "user",
      position: { x: 400, y: 450 },
      data: { label: "Custom Override", description: "User-modified response" },
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", animated: false },
    { id: "e1-3", source: "1", target: "3", animated: false },
    { id: "e2-4", source: "2", target: "4", animated: false },
    { id: "e3-4", source: "3", target: "4", animated: false },
    { id: "e4-5", source: "4", target: "5", animated: false },
    { id: "e4-6", source: "4", target: "6", animated: false },
  ],
  metadata: {
    totalNodes: 6,
    lastUpdated: new Date().toISOString(),
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  console.log("[v0] Fetching graph for project:", projectId);

  return NextResponse.json(mockGraph);
}
