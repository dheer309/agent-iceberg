import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock node-specific audit log data
const mockNodeAuditLogs = {
  content: [
    {
      type: 'text',
      text: `# Node Execution Details

This node executed successfully with the following characteristics:

## Execution Context

- **Node Type**: Model Step
- **Execution Time**: 2.3 seconds
- **Status**: Completed successfully

## Output Analysis

The model generated a comprehensive response based on the provided context. The output includes structured data that was used in subsequent steps of the workflow.

## Performance Metrics

- Token efficiency: High
- Response quality: Excellent
- Latency: Within acceptable range`,
    },
  ],
  usage: {
    inputTokens: 12450,
    outputTokens: 180,
    totalTokens: 12630,
  },
  model: {
    name: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    teamId: 'team_the_great_hack_2025_015',
  },
  performance: {
    latency: 2340.25,
    cost: 0.038421,
  },
  quota: {
    requestsToday: 98,
    tokensToday: 2382845,
    remainingBudget: 42.39,
    totalBudget: 50.0,
    llmCost: 7.6058,
    gpuCost: 0,
  },
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; nodeId: string }>
  }
) {
  const { projectId, nodeId } = await params
  console.log(
    '[v0] Fetching node-specific audit logs for:',
    projectId,
    nodeId
  )

  return NextResponse.json(mockNodeAuditLogs)
}

