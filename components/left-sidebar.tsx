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
} from "lucide-react";

interface LeftSidebarProps {
  onClose: () => void;
}

export function LeftSidebar({ onClose }: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    model: true,
    tool: true,
    branch: true,
    user: true,
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

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
              <div className="rounded-lg border border-border bg-muted/30 p-4">
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
    </motion.aside>
  );
}
