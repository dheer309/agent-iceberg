"use client"

import ReactMarkdown from "react-markdown"

interface DocumentationContentProps {
  content: string
}

export function DocumentationContent({ content }: DocumentationContentProps) {
  return (
    <div className="prose prose-invert prose-lg max-w-none dark:prose-invert">
      <style dangerouslySetInnerHTML={{ __html: `
        .prose {
          color: hsl(var(--foreground));
        }
        .prose h1 {
          color: hsl(var(--foreground));
          font-size: 2.5em;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 0.5em;
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5em;
        }
        .prose h2 {
          color: hsl(var(--foreground));
          font-size: 2em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.25em;
        }
        .prose h3 {
          color: hsl(var(--foreground));
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
        }
        .prose h4 {
          color: hsl(var(--foreground));
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .prose p {
          color: hsl(var(--muted-foreground));
          line-height: 1.75;
          margin-bottom: 1em;
        }
        .prose strong {
          color: hsl(var(--foreground));
          font-weight: 600;
        }
        .prose ul,
        .prose ol {
          color: hsl(var(--muted-foreground));
          margin-bottom: 1em;
          padding-left: 1.5em;
        }
        .prose li {
          margin-bottom: 0.5em;
          line-height: 1.75;
        }
        .prose code {
          background-color: hsl(var(--muted));
          color: hsl(var(--foreground));
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
        }
        .prose pre {
          background-color: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          padding: 1em;
          overflow-x: auto;
          margin-bottom: 1.5em;
        }
        .prose pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
          display: block;
          white-space: pre;
        }
        .prose blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1em;
          margin-left: 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        .prose a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose a:hover {
          color: hsl(var(--primary) / 0.8);
        }
        .prose hr {
          border-color: hsl(var(--border));
          margin: 2em 0;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5em;
        }
        .prose th,
        .prose td {
          border: 1px solid hsl(var(--border));
          padding: 0.5em 1em;
          text-align: left;
        }
        .prose th {
          background-color: hsl(var(--muted));
          color: hsl(var(--foreground));
          font-weight: 600;
        }
      ` }} />
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

