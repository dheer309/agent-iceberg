export function NodeLegend() {
  const nodeTypes = [
    { type: 'Model Step', color: 'bg-blue-500', icon: '🧠', description: 'AI model decision' },
    { type: 'Tool Call', color: 'bg-green-500', icon: '🔧', description: 'External tool usage' },
    { type: 'Branch', color: 'bg-orange-500', icon: '🔀', description: 'Decision point' },
    { type: 'User Edit', color: 'bg-purple-500', icon: '✏️', description: 'Manual intervention' },
  ]

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-center text-2xl font-semibold">Understanding Node Types</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:glow-subtle"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${node.color}`} />
              <span className="text-2xl">{node.icon}</span>
            </div>
            <h3 className="mb-1 font-semibold">{node.type}</h3>
            <p className="text-sm text-muted-foreground">{node.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
