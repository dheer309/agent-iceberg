import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock project-wide audit log data
const mockProjectAuditLogs = {
  content: [
    {
      type: 'text',
      text: `# Analysis Summary

This project demonstrates a comprehensive agent workflow with multiple decision points and tool integrations.

## Key Findings

1. **User Query Parsing**: Successfully extracted intent and entities from the user's input
2. **Database Integration**: Queried customer records with high accuracy
3. **Context Analysis**: Analyzed user history to provide personalized responses
4. **Decision Making**: Implemented branching logic for different response strategies

## Recommendations

- Consider caching frequently accessed database queries
- Implement retry logic for external API calls
- Add monitoring for token usage across all model calls`,
    },
  ],
  usage: {
    inputTokens: 52199,
    outputTokens: 360,
    totalTokens: 52559,
  },
  model: {
    name: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    teamId: 'team_the_great_hack_2025_015',
  },
  performance: {
    latency: 11989.85,
    cost: 0.161997,
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
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  console.log('[v0] Fetching project-wide audit logs for:', projectId)

  return NextResponse.json(mockProjectAuditLogs)
}

