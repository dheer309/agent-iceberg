"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ProjectSidebar } from "@/components/project-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Loader2, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateProjectPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedProjectResponse, setSelectedProjectResponse] =
    useState<string>("");
  const [showInputBar, setShowInputBar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch project response when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const fetchProjectResponse = async () => {
        try {
          const response = await fetch(`/api/projects/${selectedProjectId}`);
          if (response.ok) {
            const project = await response.json();
            setSelectedProjectResponse(project.response || "");
          }
        } catch (error) {
          console.error("Failed to fetch project response:", error);
          setSelectedProjectResponse("");
        }
      };
      fetchProjectResponse();
    } else {
      setSelectedProjectResponse("");
    }
  }, [selectedProjectId]);

  // Focus input when modal opens
  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (response.ok) {
        const project = await response.json();
        setShowInputBar(true);
        setShowModal(false);
        // Don't navigate, stay on this page
      } else {
        console.error("Failed to create project");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden pt-16">
      {/* Sidebar */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onProjectClick={(projectId) => {
          setSelectedProjectId(projectId);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-40 p-2 rounded-lg bg-card border border-border hover:bg-accent hover:border-primary/50 transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Glassmorphism Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => {}}
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
              >
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Create New Project
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Give your project a name to get started
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter project name..."
                      disabled={isLoading}
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
                      onClick={() => setShowModal(false)}
                      disabled={isLoading}
                      className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!projectName.trim() || isLoading}
                      className="flex-1 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50"
                    >
                      {isLoading ? (
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

        {/* Main Chat Area - Hidden when modal is shown */}
        {!showModal && (
          <>
            {/* Response Panel - Shown when project is selected */}
            {selectedProjectId ? (
              <div className="flex-1 overflow-y-auto px-4 py-8 pb-32">
                <div className="mx-auto max-w-4xl">
                  <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2">
                        Analysis Response
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        View the detailed analysis results below
                      </p>
                    </div>
                    <div
                      className={cn(
                        "prose prose-invert max-w-none",
                        "text-foreground",
                        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6",
                        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5",
                        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4",
                        "[&_p]:mb-4 [&_p]:leading-relaxed",
                        "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4",
                        "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4",
                        "[&_li]:mb-2",
                        "[&_strong]:font-bold [&_strong]:text-foreground",
                        "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
                      )}
                    >
                      <ReactMarkdown>{selectedProjectResponse}</ReactMarkdown>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border">
                      <Link href={`/project/${selectedProjectId}`}>
                        <Button className="w-full sm:w-auto">
                          View Analytics
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center px-4 pb-32">
                <div className="w-full max-w-3xl mx-auto text-center">
                  <div className="mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                      Storage{" "}
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Bank
                      </span>
                    </h1>
                    <p className="text-muted-foreground text-lg sm:text-xl">
                      Select a completed project and view its final output.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area - Fixed at Bottom - Only show if showInputBar is true and no project is selected */}
            {showInputBar && !selectedProjectId && (
              <div className="fixed bottom-0 left-0 right-0 lg:left-64 border-t border-border bg-background/95 backdrop-blur-sm z-30">
                <div className="mx-auto max-w-3xl px-4 py-4">
                  <form onSubmit={handleSubmit} className="relative">
                    <div className="relative">
                      <Input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Name your analysis..."
                        disabled={isLoading}
                        className={cn(
                          "w-full h-12 text-base pr-12",
                          "bg-card border-border",
                          "focus-visible:ring-primary/50 focus-visible:border-primary/50",
                          "transition-all",
                          "hover:border-primary/30"
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={!projectName.trim() || isLoading}
                        size="icon"
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9",
                          "bg-primary hover:bg-primary/90 hover:scale-105",
                          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                          "transition-transform shadow-lg hover:shadow-primary/50"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-center text-muted-foreground">
                      Press Enter to submit
                    </p>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
