import { NextResponse } from "next/server";
import { graphPayload } from "@/lib/payloads/graph-payload";
import { mockProjectsStore } from "@/lib/mock-projects";

export const dynamic = "force-dynamic";

// Calculate tokens from data size (estimate: ~4 characters per token)
function estimateTokens(data: any): number {
  if (!data) return 0;
  const jsonString = JSON.stringify(data);
  return Math.ceil(jsonString.length / 4);
}

// Generate model name based on node kind
function getModelName(kind: string): string {
  switch (kind) {
    case "agent":
      return "us.anthropic.claude-3-5-sonnet-20241022-v2:0";
    case "tool":
      return "valyu-search-tool";
    case "decision":
      return "pipeline-router";
    default:
      return "us.anthropic.claude-3-5-sonnet-20241022-v2:0";
  }
}

// Generate content markdown from completed data or node definition
function generateContent(
  node: any,
  completedData: any | null
): Array<{ type: string; text: string }> {
  if (completedData) {
    // Node has execution data
    const query = completedData.query || "N/A";
    const timestamp = completedData.timestamp || "N/A";
    const txId = completedData.raw?.tx_id || "N/A";
    const results = completedData.results || [];
    const topResults = results.slice(0, 5);

    let contentText = `# Node Execution Details\n\n`;
    contentText += `## Execution Context\n\n`;
    contentText += `- **Node**: ${node.label}\n`;
    contentText += `- **Node Type**: ${node.kind}\n`;
    contentText += `- **Execution Time**: ${timestamp}\n`;
    contentText += `- **Status**: Completed successfully\n`;
    contentText += `- **Transaction ID**: ${txId}\n\n`;

    if (query && query !== "N/A") {
      contentText += `## Query/Request\n\n`;
      contentText += `${query}\n\n`;
    }

    if (topResults.length > 0) {
      contentText += `## Results Summary\n\n`;
      topResults.forEach((result: any, index: number) => {
        contentText += `### ${index + 1}. ${result.title || "Untitled"}\n\n`;
        if (result.relevance_score) {
          contentText += `**Relevance Score**: ${(
            result.relevance_score * 100
          ).toFixed(2)}%\n\n`;
        }
        if (result.url) {
          contentText += `**URL**: ${result.url}\n\n`;
        }
        if (result.description) {
          const desc = result.description.substring(0, 200);
          contentText += `${desc}${
            result.description.length > 200 ? "..." : ""
          }\n\n`;
        }
      });
      if (results.length > 5) {
        contentText += `\n*... and ${results.length - 5} more results*\n`;
      }
    }

    if (completedData.raw?.total_characters) {
      contentText += `\n## Data Statistics\n\n`;
      contentText += `- **Total Characters**: ${completedData.raw.total_characters.toLocaleString()}\n`;
      contentText += `- **Results Count**: ${results.length}\n`;
    }

    return [{ type: "text", text: contentText }];
  } else {
    // Node not yet executed - show definition
    let contentText = `# Node Definition\n\n`;
    contentText += `## Node Information\n\n`;
    contentText += `- **Label**: ${node.label}\n`;
    contentText += `- **Type**: ${node.kind}\n`;
    contentText += `- **Description**: ${
      node.description || "No description available"
    }\n\n`;
    contentText += `## Status\n\n`;
    contentText += `**Not yet executed**\n\n`;

    if (node.inputs && node.inputs.length > 0) {
      contentText += `## Inputs\n\n`;
      node.inputs.forEach((input: string) => {
        contentText += `- ${input}\n`;
      });
      contentText += `\n`;
    }

    if (node.outputs && node.outputs.length > 0) {
      contentText += `## Outputs\n\n`;
      node.outputs.forEach((output: string) => {
        contentText += `- ${output}\n`;
      });
    }

    return [{ type: "text", text: contentText }];
  }
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; nodeId: string }>;
  }
) {
  const { projectId, nodeId } = await params;
  console.log("[v0] Fetching node-specific audit logs for:", projectId, nodeId);

  // Get project from store
  const project = mockProjectsStore[projectId];
  if (!project || !project.sessionID) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Find matching payload entry by session_id
  const payloadEntry = graphPayload.find(
    (entry: any) => entry.session_id === project.sessionID
  );

  // Type guard: check if payloadEntry has pipeline_graph property
  if (
    !payloadEntry ||
    !("pipeline_graph" in payloadEntry) ||
    !payloadEntry.pipeline_graph ||
    !payloadEntry.pipeline_graph.nodes
  ) {
    return NextResponse.json(
      { error: "Pipeline graph not found" },
      { status: 404 }
    );
  }

  // Find the specific node by nodeId
  const node = payloadEntry.pipeline_graph.nodes.find(
    (n: any) => n.id === nodeId
  );

  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  // Get completed_nodes data if available, using node.id from pipeline_graph.nodes
  const completedNodes = payloadEntry.completed_nodes || {};
  const completedNodeData =
    (completedNodes as Record<string, any>)[node.id] || null;

  // Generate content
  const content = generateContent(node, completedNodeData);

  // Calculate usage (tokens)
  let inputTokens = 0;
  let outputTokens = 0;

  if (completedNodeData) {
    // Estimate input tokens from request_params or query
    if (completedNodeData.request_params) {
      inputTokens = estimateTokens(completedNodeData.request_params);
    } else if (completedNodeData.query) {
      inputTokens = estimateTokens({ query: completedNodeData.query });
    }

    // Estimate output tokens from results
    if (completedNodeData.results) {
      outputTokens = estimateTokens(completedNodeData.results);
    }
  } else {
    // Default values for non-executed nodes
    inputTokens = 0;
    outputTokens = 0;
  }

  const totalTokens = inputTokens + outputTokens;

  // Model information
  const modelName = getModelName(node.kind || "agent");
  const teamId = project.sessionID
    ? `team_${project.sessionID.substring(0, 8)}`
    : "team_default";

  // Performance metrics
  const cost = completedNodeData?.raw?.total_deduction_dollars || 0;
  // Estimate latency (placeholder - not available in payload)
  const latency = completedNodeData ? 1500 + Math.random() * 1000 : 0;

  // Quota information (derive from available data)
  const llmCost = cost;
  const gpuCost = 0;
  const totalBudget = 50.0;
  const remainingBudget = Math.max(0, totalBudget - llmCost - gpuCost);
  const requestsToday = completedNodeData ? 1 : 0;
  const tokensToday = totalTokens;

  const auditLogData = {
    content,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens,
    },
    model: {
      name: modelName,
      teamId,
    },
    performance: {
      latency: Math.round(latency * 100) / 100,
      cost,
    },
    quota: {
      requestsToday,
      tokensToday,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
      totalBudget,
      llmCost: Math.round(llmCost * 10000) / 10000,
      gpuCost,
    },
  };

  return NextResponse.json(auditLogData);
}
