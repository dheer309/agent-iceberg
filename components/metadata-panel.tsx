"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  BarChart3,
  Settings,
  DollarSign,
  Copy,
  Code,
  ChevronDown,
  Search,
  Zap,
  TrendingUp,
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AuditLogData {
  content: Array<{ type: string; text: string }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: {
    name: string;
    teamId: string;
  };
  performance: {
    latency: number;
    cost: number;
  };
  quota: {
    requestsToday: number;
    tokensToday: number;
    remainingBudget: number;
    totalBudget: number;
    llmCost: number;
    gpuCost: number;
  };
}

interface MetadataPanelProps {
  projectId: string;
  nodeId?: string;
}

export function MetadataPanel({ projectId, nodeId }: MetadataPanelProps) {
  const [data, setData] = useState<AuditLogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const url = nodeId
          ? `/api/project/${projectId}/node/${nodeId}/audit-logs`
          : `/api/project/${projectId}/audit-logs`;
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [projectId, nodeId]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getBudgetPercentage = () => {
    if (!data) return 0;
    const used = data.quota.totalBudget - data.quota.remainingBudget;
    return (used / data.quota.totalBudget) * 100;
  };

  const getProgressVariant = (
    percentage: number
  ): "default" | "success" | "warning" | "danger" => {
    if (percentage < 50) return "success";
    if (percentage < 80) return "warning";
    return "danger";
  };

  const filterData = (data: AuditLogData | null): boolean => {
    if (!data || !searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const contentText = data.content.map((c) => c.text).join(" ");
    return (
      contentText.toLowerCase().includes(query) ||
      data.model.name.toLowerCase().includes(query) ||
      data.model.teamId.toLowerCase().includes(query) ||
      data.usage.inputTokens.toString().includes(query) ||
      data.usage.outputTokens.toString().includes(query) ||
      data.performance.latency.toString().includes(query) ||
      data.performance.cost.toString().includes(query)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading audit logs...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No audit log data available</div>
      </div>
    );
  }

  if (!filterData(data)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          No results found for "{searchQuery}"
        </div>
      </div>
    );
  }

  const budgetPercentage = getBudgetPercentage();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-4 overflow-x-hidden"
    >
      {/* Search and Raw JSON Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search metadata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={showRawJson} onOpenChange={setShowRawJson}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Code className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Raw JSON</DialogTitle>
            </DialogHeader>
            <pre className="text-xs bg-muted/30 p-4 rounded-lg overflow-auto">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </DialogContent>
        </Dialog>
      </div>

      {/* 1. LLM Output Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold">Model Output</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div
            variants={fadeInUp}
            className="mt-2 rounded-lg border border-border bg-black/50 p-4 overflow-x-auto"
          >
            <div className="mb-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCopy(data.content.map((c) => c.text).join("\n\n"))
                }
                className="h-8"
              >
                {copied ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="prose prose-invert max-w-none text-sm">
              {data.content.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="mb-4 rounded-lg bg-muted/20 p-3 border-l-4 border-blue-500 overflow-x-auto"
                >
                  <div className="text-muted-foreground break-words">
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* 2. Token & Usage Statistics Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-semibold">Usage Summary</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div variants={fadeInUp} className="mt-2">
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent min-w-0">
              <CardContent className="flex flex-row gap-6 pt-0">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Input Tokens
                  </div>
                  <div className="text-sm font-semibold">
                    {data.usage.inputTokens.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Output Tokens
                  </div>
                  <div className="text-sm font-semibold">
                    {data.usage.outputTokens.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Tokens
                  </div>
                  <div className="text-sm font-semibold">
                    {data.usage.totalTokens.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* 3. Model & Performance Metadata Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold">Model Details</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div
            variants={fadeInUp}
            className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent min-w-0">
              <CardHeader>
                <CardTitle className="text-sm">Model Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Model Name
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Brain className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-mono truncate">
                      {data.model.name}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Team ID
                  </div>
                  <div className="text-sm font-mono break-all">
                    {data.model.teamId}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent min-w-0">
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Latency
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {data.performance.latency.toLocaleString()} ms
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Cost (USD)
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      ${data.performance.cost.toFixed(6)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* 4. Budget & Quota Monitoring Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span className="text-sm font-semibold">
              Quota & Budget Overview
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div variants={fadeInUp} className="mt-2 space-y-4">
            {/* Daily Limits */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                Daily Limits
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/20 p-3 min-w-0 overflow-hidden">
                  <div className="text-xs text-muted-foreground mb-1">
                    Requests Today
                  </div>
                  <div className="text-lg font-semibold truncate">
                    {data.quota.requestsToday}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 min-w-0 overflow-hidden">
                  <div className="text-xs text-muted-foreground mb-1">
                    Tokens Today
                  </div>
                  <div className="text-lg font-semibold truncate">
                    {data.quota.tokensToday.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground">
                Financial Summary
              </div>

              {/* Budget Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs gap-2 min-w-0">
                  <span className="text-muted-foreground flex-shrink-0">
                    Remaining Budget
                  </span>
                  <span className="font-semibold truncate text-right">
                    ${data.quota.remainingBudget.toFixed(2)} / $
                    {data.quota.totalBudget.toFixed(2)} USD
                  </span>
                </div>
                <Progress
                  value={budgetPercentage}
                  variant={getProgressVariant(budgetPercentage)}
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  Budget Usage: {budgetPercentage.toFixed(2)}%
                </div>
              </div>

              {/* Cost Pills */}
              <div className="flex gap-2 flex-wrap">
                <div className="rounded-full border border-border bg-muted/20 px-3 py-1.5 min-w-0 overflow-hidden">
                  <span className="text-xs text-muted-foreground">
                    LLM Cost:{" "}
                  </span>
                  <span className="text-xs font-semibold">
                    ${data.quota.llmCost.toFixed(4)}
                  </span>
                </div>
                <div className="rounded-full border border-border bg-muted/20 px-3 py-1.5 min-w-0 overflow-hidden">
                  <span className="text-xs text-muted-foreground">
                    GPU Cost:{" "}
                  </span>
                  <span className="text-xs font-semibold">
                    ${data.quota.gpuCost.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
