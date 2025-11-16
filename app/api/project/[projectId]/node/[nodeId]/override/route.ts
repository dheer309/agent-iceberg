import { NextResponse } from "next/server";
import { mockProjectsStore } from "@/lib/mock-projects";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  const { projectId, nodeId } = await params;
  const body = await request.json();

  console.log("[v0] Override node:", {
    projectId,
    nodeId,
    content: body.content,
  });

  // Get project from store to retrieve sessionID
  const project = mockProjectsStore[projectId];
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const sessionID = project.sessionID;
  if (!sessionID) {
    return NextResponse.json(
      { error: "Session ID not found in project data" },
      { status: 400 }
    );
  }

  try {
    // Call the external override API endpoint
    const overrideResponse = await fetch(
      `http://localhost:8000/sessions/${sessionID}/override`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: nodeId,
          payload: {
            content: body.content,
          },
        }),
      }
    );

    if (!overrideResponse.ok) {
      const errorText = await overrideResponse.text();
      console.error(
        `[v0] Override API returned status ${overrideResponse.status}:`,
        errorText
      );
      return NextResponse.json(
        {
          error: `Override API returned status ${overrideResponse.status}`,
          details: errorText,
        },
        { status: overrideResponse.status }
      );
    }

    const responseData = await overrideResponse.text();
    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("[v0] Failed to call override API:", error);
    return NextResponse.json(
      {
        error: "Failed to call override API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
