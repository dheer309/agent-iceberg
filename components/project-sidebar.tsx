"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Clock, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  nodeCount: number;
  updatedAt: string;
  response?: string;
}

interface ProjectSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onProjectClick?: (projectId: string) => void;
}

export function ProjectSidebar({
  isOpen,
  onToggle,
  onProjectClick,
}: ProjectSidebarProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (response.ok) {
        const project = await response.json();
        setProjectName("");
        setShowModal(false);
        // Refresh projects list
        await fetchProjects();
        // Navigate to the new project
        router.push(`/project/${project.id}`);
      } else {
        console.error("Failed to create project");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isCreating) {
      handleCreateProject(e);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static top-16 bottom-0 left-0 z-50 w-64 border-r border-border bg-black transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-t border-border p-4">
            <h2 className="text-lg font-semibold">Previous Projects</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Add New Project Section */}
          <div className="border-b border-t border-border p-4">
            <Button
              onClick={() => setShowModal(true)}
              className="w-full gap-2"
              variant="default"
            >
              <Plus className="h-4 w-4" />
              Add New Project
            </Button>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No projects yet
              </div>
            ) : (
              <div className="p-2">
                {projects.map((project) => {
                  const handleClick = (e: React.MouseEvent) => {
                    if (onProjectClick) {
                      e.preventDefault();
                      onProjectClick(project.id);
                    }
                  };

                  const content = (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(project.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  );

                  if (onProjectClick) {
                    return (
                      <button
                        key={project.id}
                        onClick={handleClick}
                        className="block w-full text-left p-3 rounded-lg hover:bg-accent/50 border border-transparent hover:border-border transition-all mb-1 group"
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={project.id}
                      href={`/project/${project.id}`}
                      className="block p-3 rounded-lg hover:bg-accent/50 border border-transparent hover:border-border transition-all mb-1 group"
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
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
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Create New Analysis
                </h2>
                <p className="text-sm text-muted-foreground">
                  Give your analysis a name to get started
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter project name..."
                    disabled={isCreating}
                    className={cn(
                      "w-full h-12 text-base",
                      "bg-white/5 border-white/10",
                      "focus-visible:border-primary/50 focus-visible:ring-primary/20",
                      "backdrop-blur-sm",
                      "placeholder:text-muted-foreground/50"
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setProjectName("");
                    }}
                    disabled={isCreating}
                    className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!projectName.trim() || isCreating}
                    className="flex-1 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
