"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  X,
  Brain,
  Wrench,
  GitBranch,
  PencilLine,
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeftSidebarProps {
  projectId: string;
  onClose: () => void;
}

export function LeftSidebar({ projectId, onClose }: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    model: true,
    tool: true,
    branch: true,
    user: true,
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentNode, setCurrentNode] = useState<string>("");
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showNodeSuccessModal, setShowNodeSuccessModal] = useState(false);
  const [showAllCompleteModal, setShowAllCompleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const expandedVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const collapsedVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const handleGenerateNext = async () => {
    setIsGenerating(true);
    setShowNodeModal(true);
    setErrorMessage("");
    setCurrentNode(""); // Reset node name

    try {
      const response = await fetch(`/api/project/${projectId}/step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API returned status ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        const nodeName = data.currentNode || "Node";
        setCurrentNode(nodeName);
        
        // Close generation modal
        setShowNodeModal(false);

        // Trigger graph refresh
        window.dispatchEvent(new Event("graph-refresh"));

        // Show appropriate success modal
        if (data.isComplete) {
          setShowAllCompleteModal(true);
        } else {
          setShowNodeSuccessModal(true);
        }
      } else {
        throw new Error("Failed to generate next node");
      }
    } catch (error) {
      console.error("[v0] Failed to generate next node:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      // Keep modal open to show error
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.aside
      className="relative border-r border-border bg-black"
      animate={{ width: isCollapsed ? 48 : 320 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-background shadow-md hover:bg-accent transition-all duration-300 hover:scale-110"
      >
        <div className="relative h-4 w-4">
          <ChevronRight
            className={`absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out ${
              isCollapsed ? "rotate-0 opacity-100" : "rotate-180 opacity-0"
            }`}
          />
          <ChevronLeft
            className={`absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out ${
              isCollapsed ? "rotate-180 opacity-0" : "rotate-0 opacity-100"
            }`}
          />
        </div>
      </Button>

      <motion.div
        className="h-full overflow-hidden"
        animate={{ padding: isCollapsed ? "0.5rem" : "1.5rem" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              variants={expandedVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters & Search</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <Label htmlFor="search" className="mb-2 text-sm">
                  Search Nodes
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by label or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Node Type Filters */}
              <div className="mb-6">
                <Label className="mb-3 text-sm">Node Types</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="model"
                      checked={filters.model}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, model: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="model"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Brain className="h-4 w-4 text-blue-500" />
                      <span>Model Steps</span>
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="tool"
                      checked={filters.tool}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, tool: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="tool"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Wrench className="h-4 w-4 text-green-500" />
                      <span>Tool Calls</span>
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="branch"
                      checked={filters.branch}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, branch: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="branch"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <GitBranch className="h-4 w-4 text-orange-500" />
                      <span>Branches</span>
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="user"
                      checked={filters.user}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, user: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="user"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <PencilLine className="h-4 w-4 text-purple-500" />
                      <span>User Edits</span>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="mb-3 text-sm font-semibold">Legend</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">
                      Model decision
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">External tool</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">
                      Decision point
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">
                      Manual intervention
                    </span>
                  </div>
                </div>
              </div>

              {/* Generate Next Button */}
              <motion.div
                variants={expandedVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Button
                  onClick={handleGenerateNext}
                  disabled={isGenerating}
                  className={cn(
                    "w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50 transition-all duration-300",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate Next
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              variants={collapsedVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4 pt-8"
            >
              <Search className="h-5 w-5 text-muted-foreground transition-all duration-300 hover:scale-110" />
              <Brain className="h-5 w-5 text-blue-500 transition-all duration-300 hover:scale-110" />
              <Wrench className="h-5 w-5 text-green-500 transition-all duration-300 hover:scale-110" />
              <GitBranch className="h-5 w-5 text-orange-500 transition-all duration-300 hover:scale-110" />
              <PencilLine className="h-5 w-5 text-purple-500 transition-all duration-300 hover:scale-110" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Node Generation Notification Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => {
              // Non-dismissible during generation
              if (!isGenerating) {
                setShowNodeModal(false);
              }
            }}
          />
          <div className="relative w-full max-w-md fade-in zoom-in">
            <div
              className={cn(
                "relative rounded-2xl border border-white/10",
                "bg-gradient-to-br from-black/80 via-black/60 to-black/80",
                "backdrop-blur-xl shadow-2xl",
                "p-8 space-y-6"
              )}
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
              }}
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  {errorMessage ? (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  ) : (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {errorMessage ? "Error" : "Generating Node"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {errorMessage
                    ? errorMessage
                    : currentNode
                    ? `Processing ${currentNode}...`
                    : "Processing node..."}
                </p>
              </div>
              {errorMessage && (
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNodeModal(false);
                      setErrorMessage("");
                    }}
                    className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Single Node Success Modal */}
      {showNodeSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowNodeSuccessModal(false)}
          />
          <div className="relative w-full max-w-md fade-in zoom-in">
            <div
              className={cn(
                "relative rounded-2xl border border-white/10",
                "bg-gradient-to-br from-black/80 via-black/60 to-black/80",
                "backdrop-blur-xl shadow-2xl",
                "p-8 space-y-6"
              )}
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
              }}
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Node Generated Successfully
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentNode} has been completed
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowNodeSuccessModal(false)}
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Complete Modal */}
      {showAllCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowAllCompleteModal(false)}
          />
          <div className="relative w-full max-w-md fade-in zoom-in">
            <div
              className={cn(
                "relative rounded-2xl border border-white/10",
                "bg-gradient-to-br from-black/80 via-black/60 to-black/80",
                "backdrop-blur-xl shadow-2xl",
                "p-8 space-y-6"
              )}
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
              }}
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Pipeline Complete
                </h2>
                <p className="text-sm text-muted-foreground">
                  All nodes have been generated successfully
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowAllCompleteModal(false)}
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
