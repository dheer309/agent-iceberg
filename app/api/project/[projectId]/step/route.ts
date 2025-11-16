import { NextResponse } from "next/server";
import { mockProjectsStore } from "@/lib/mock-projects";
import { promises as fs } from "fs";
import path from "path";
import { cleanPayload } from "@/lib/middleware/cleanPayload";

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // Get project from shared store
  const project = mockProjectsStore[projectId];

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!project.sessionID) {
    return NextResponse.json(
      { error: "Session ID not found in project" },
      { status: 400 }
    );
  }

  const sessionId = project.sessionID;

  console.log("[Step Route] Attempting to call step endpoint:", {
    projectId,
    sessionId,
    url: `http://localhost:8000/sessions/${sessionId}/step`,
  });

  try {
    // Call localhost:8000/sessions/{sessionID}/step
    const stepResponse = await fetch(
      `http://localhost:8000/sessions/${sessionId}/step`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steps: 1,
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    console.log("[Step Route] Response status:", stepResponse.status);

    if (!stepResponse.ok) {
      const errorText = await stepResponse.text();
      console.error("[Step Route] API returned error:", {
        status: stepResponse.status,
        statusText: stepResponse.statusText,
        body: errorText,
      });
      throw new Error(
        `External API step endpoint returned status ${stepResponse.status}: ${errorText}`
      );
    }

    const stepData = await stepResponse.text();
    console.log("[Step Route] Response received, length:", stepData.length);
    const parsedData = JSON.parse(stepData);

    // Extract node information from response
    const nextNode = parsedData.next_node || null;
    const isComplete = parsedData.is_complete || false;
    const completedNodes = parsedData.completed_nodes || {};

    // Get the name of the node that was just executed
    // The completed_nodes object contains the newly completed nodes (from the step execution)
    // Since we execute steps: 1, there should be exactly one new node
    const completedNodeKeys = Object.keys(completedNodes);
    let executedNodeName = "Node";

    if (completedNodeKeys.length > 0) {
      // Use the first (and likely only) newly completed node
      executedNodeName = completedNodeKeys[0];
      // Format node name for display (replace underscores with spaces, capitalize)
      executedNodeName = executedNodeName
        .replace(/_/g, " ")
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else if (nextNode) {
      // Fallback: use next_node if no completed nodes found
      executedNodeName = nextNode
        .replace(/_/g, " ")
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Update graph-payload.ts
    const graphPayloadPath = path.join(
      process.cwd(),
      "lib",
      "payloads",
      "graph-payload.ts"
    );

    try {
      // Read existing file if it exists
      let existingPayloads: any[] = [];
      try {
        const existingContent = await fs.readFile(graphPayloadPath, "utf-8");
        const startIndex = existingContent.indexOf(
          "export const graphPayload = "
        );
        if (startIndex !== -1) {
          const valueStart = startIndex + "export const graphPayload = ".length;
          const asConstIndex = existingContent.indexOf(" as const", valueStart);
          const valueEnd =
            asConstIndex !== -1 ? asConstIndex : existingContent.length;
          const valueStr = existingContent
            .substring(valueStart, valueEnd)
            .trim();

          if (valueStr) {
            if (valueStr.startsWith("[") && valueStr.endsWith("]")) {
              existingPayloads = JSON.parse(valueStr);
            } else {
              const existingObject = JSON.parse(valueStr);
              existingPayloads = [existingObject];
            }
          }
        }
      } catch (readError) {
        // File doesn't exist or is invalid, start with empty array
        existingPayloads = [];
      }

      // Clean the payload
      const cleanedData = cleanPayload(parsedData);

      // Find existing entry by session_id and update it, or append if not found
      const existingIndex = existingPayloads.findIndex(
        (entry: any) => entry.session_id === sessionId
      );

      if (existingIndex !== -1) {
        // Merge the new data with existing entry
        existingPayloads[existingIndex] = {
          ...existingPayloads[existingIndex],
          ...cleanedData,
        };
      } else {
        // Append new payload to the array
        existingPayloads.push(cleanedData);
      }

      // Write back as array
      const tsContent = `export const graphPayload = ${JSON.stringify(
        existingPayloads,
        null,
        2
      )} as const\n`;
      await fs.writeFile(graphPayloadPath, tsContent, "utf-8");
    } catch (parseError) {
      console.error("Failed to update graph-payload.ts:", parseError);
      // Continue even if file write fails
    }

    return NextResponse.json({
      success: true,
      currentNode: executedNodeName,
      isComplete: isComplete,
      nextNode: nextNode,
    });
  } catch (error) {
    console.error("[Step Route] External API call failed:", {
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
      sessionId,
      projectId,
    });

    // Provide more specific error messages
    let errorMessage = "External API unavailable";
    let statusCode = 502;

    if (error instanceof TypeError) {
      if (error.message.includes("fetch")) {
        errorMessage =
          "Cannot connect to external API. Is the server running on localhost:8000?";
      } else if (
        error.message.includes("timeout") ||
        error.message.includes("aborted")
      ) {
        errorMessage = "Request to external API timed out";
        statusCode = 504;
      }
    } else if (error instanceof Error) {
      if (error.message.includes("404")) {
        errorMessage = `Session ${sessionId} not found on external API. The session may have expired or been cleared.`;
        statusCode = 404;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        sessionId: sessionId,
      },
      { status: statusCode }
    );
  }
}
