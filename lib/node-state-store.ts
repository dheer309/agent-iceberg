// Shared in-memory store for node states (disabled, deleted)
// In a real app, this would be a database

const disabledNodesStore: Record<string, Set<string>> = {}
const deletedNodesStore: Record<string, Set<string>> = {}

export function getDisabledNodes(projectId: string): Set<string> {
  if (!disabledNodesStore[projectId]) {
    disabledNodesStore[projectId] = new Set()
  }
  return disabledNodesStore[projectId]
}

export function getDeletedNodes(projectId: string): Set<string> {
  if (!deletedNodesStore[projectId]) {
    deletedNodesStore[projectId] = new Set()
  }
  return deletedNodesStore[projectId]
}

