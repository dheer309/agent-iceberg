"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MetadataPanel } from "@/components/metadata-panel";
import {
  X,
  ChevronDown,
  Pencil,
  RefreshCw,
  Trash2,
  GitBranchPlus,
  Ban,
  Loader2,
} from "lucide-react";

interface RightPanelProps {
  projectId: string;
  nodeId: string;
  onClose: () => void;
}

interface NodeDetails {
  id: string;
  type: string;
  label: string;
  description: string;
  explanation: string;
  metadata: {
    prompt?: string;
    model?: string;
    toolInput?: string;
    toolOutput?: string;
    stepId?: string;
  };
}

export function RightPanel({ projectId, nodeId, onClose }: RightPanelProps) {
  const [node, setNode] = useState<NodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editInstruction, setEditInstruction] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const fetchNodeDetails = async () => {
      try {
        const response = await fetch(
          `/api/project/${projectId}/node/${nodeId}`
        );
        if (response.ok) {
          const data = await response.json();
          setNode(data);
        }
      } catch (error) {
        console.error("[v0] Failed to fetch node details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNodeDetails();
  }, [projectId, nodeId]);

  const handleRegenerate = async () => {
    if (!editInstruction.trim()) return;

    setIsRegenerating(true);
    try {
      const response = await fetch(
        `/api/project/${projectId}/node/${nodeId}/modify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editInstruction }),
        }
      );

      if (response.ok) {
        setEditInstruction("");
        // Refresh node details
      }
    } catch (error) {
      console.error("[v0] Failed to regenerate node:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/project/${projectId}/node/${nodeId}/delete`, {
        method: "POST",
      });
      onClose();
    } catch (error) {
      console.error("[v0] Failed to delete node:", error);
    }
  };

  return (
    <aside className="w-96 overflow-y-auto border-l border-border bg-black p-6 flex-shrink-0 z-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          {loading ? (
            <>
              <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </>
          ) : node ? (
            <>
              <h2 className="text-lg font-semibold">{node.label}</h2>
              <p className="text-sm text-muted-foreground capitalize">
                {node.type} Node
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Node {nodeId}</h2>
              <p className="text-sm text-muted-foreground">
                Unable to load details
              </p>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : node ? (
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Node Details</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            {/* Explanation */}
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">What This Does</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {node.explanation}
              </p>
            </div>

            {/* Edit Instruction */}
            <div className="mb-6">
              <Label htmlFor="edit" className="mb-2 text-sm">
                Modify This Step
              </Label>
              <Textarea
                id="edit"
                placeholder="Describe how you want to change this step..."
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                rows={4}
                className="mb-2"
              />
              <Button
                onClick={handleRegenerate}
                disabled={!editInstruction.trim() || isRegenerating}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Modify & Regenerate
                  </>
                )}
              </Button>
            </div>

            {/* Actions */}
            <div className="mb-6 space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <RefreshCw className="h-4 w-4" />
                Regenerate from Here
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <GitBranchPlus className="h-4 w-4" />
                Create Branch
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Ban className="h-4 w-4" />
                Disable Node
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete Node
              </Button>
            </div>

            {/* Metadata */}
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30">
                <span className="text-sm font-semibold">Metadata</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 rounded-lg border border-border bg-muted/20 p-4">
                <div className="space-y-3 text-xs">
                  {node.metadata.model && (
                    <div>
                      <div className="font-semibold text-foreground">Model</div>
                      <div className="text-muted-foreground">
                        {node.metadata.model}
                      </div>
                    </div>
                  )}
                  {node.metadata.stepId && (
                    <div>
                      <div className="font-semibold text-foreground">
                        Step ID
                      </div>
                      <div className="font-mono text-muted-foreground">
                        {node.metadata.stepId}
                      </div>
                    </div>
                  )}
                  {node.metadata.prompt && (
                    <div>
                      <div className="font-semibold text-foreground">
                        Prompt
                      </div>
                      <div className="text-muted-foreground whitespace-pre-wrap">
                        {node.metadata.prompt}
                      </div>
                    </div>
                  )}
                  {node.metadata.toolInput && (
                    <div>
                      <div className="font-semibold text-foreground">
                        Tool Input
                      </div>
                      <div className="font-mono text-muted-foreground whitespace-pre-wrap">
                        {node.metadata.toolInput}
                      </div>
                    </div>
                  )}
                  {node.metadata.toolOutput && (
                    <div>
                      <div className="font-semibold text-foreground">
                        Tool Output
                      </div>
                      <div className="font-mono text-muted-foreground whitespace-pre-wrap">
                        {node.metadata.toolOutput}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="audit-logs" className="mt-4">
            <MetadataPanel projectId={projectId} nodeId={nodeId} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Failed to load node details
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}
    </aside>
  );
}
