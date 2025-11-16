"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { ProjectSidebar } from "@/components/project-sidebar";
import { CreateProjectModal } from "@/components/create-project-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, Loader2, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fadeInUp,
  fadeInLeft,
  containerVariants,
  childVariants,
} from "@/lib/animations";

export default function CreateProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedProjectResponse, setSelectedProjectResponse] =
    useState<string>("");
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [showInputBar, setShowInputBar] = useState(false);
  const [showInputSkeleton, setShowInputSkeleton] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Check for openModal query parameter and open modal automatically
  useEffect(() => {
    const openModal = searchParams.get("openModal");
    if (openModal === "true") {
      setShowModal(true);
      // Clean up the URL by removing the query parameter
      router.replace("/create-project", { scroll: false });
    }
  }, [searchParams, router]);

  // Fetch project response when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      setIsLoadingResponse(true);
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
        } finally {
          setIsLoadingResponse(false);
        }
      };
      fetchProjectResponse();
    } else {
      setSelectedProjectResponse("");
      setIsLoadingResponse(false);
    }
  }, [selectedProjectId]);

  const handleCreateProject = async (name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const project = await response.json();
        setShowInputBar(true);
        setShowModal(false);
        setProjectName(name);
        setCurrentProjectId(project.id);
        setSelectedProjectId(null); // Clear selected project to show input area
        setIsLoading(false);
        // Show input skeleton briefly
        setShowInputSkeleton(true);
        setTimeout(() => setShowInputSkeleton(false), 300);
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

  const handleSubmitPrompt = async (prompt: string) => {
    if (!prompt.trim() || isLoading || !currentProjectId) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${currentProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: prompt.trim() }),
      });

      if (response.ok) {
        setUserPrompt(prompt.trim());
        setPromptInput(""); // Clear input after storing
        setShowSuccessModal(true);
        // Auto-close after 3 seconds and display the project
        setTimeout(() => {
          setShowSuccessModal(false);
          if (currentProjectId) {
            setSelectedProjectId(currentProjectId);
          }
        }, 3000);
      } else {
        console.error("Failed to update project prompt");
      }
    } catch (error) {
      console.error("Failed to update project prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Automatically display the project when modal closes
    if (currentProjectId) {
      setSelectedProjectId(currentProjectId);
    }
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Sidebar */}
      <motion.div initial="hidden" animate="visible" variants={fadeInLeft}>
        <ProjectSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onProjectClick={(projectId) => {
            setSelectedProjectId(projectId);
          }}
          onAddNewProject={() => setShowModal(true)}
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-40 p-2 rounded-lg bg-card border border-border hover:bg-accent hover:border-primary/50 transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Create Project Modal */}
        <CreateProjectModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateProject}
          isLoading={isLoading}
        />

        {/* Success Modal */}
        <CreateProjectModal
          open={showSuccessModal}
          onClose={handleCloseSuccessModal}
          onSubmit={handleCloseSuccessModal}
          title="Prompt Submitted"
          description="Your prompt has been successfully submitted and is being processed."
          submitLabel="Got it"
          cancelLabel=""
          icon={<Check className="h-8 w-8 text-primary" />}
          isLoading={false}
          initialValue=""
          showInput={false}
        />

        {/* Main Chat Area - Hidden when modal is shown */}
        {!showModal && (
          <>
            {/* Response Panel - Shown when project is selected */}
            {selectedProjectId ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex-1 overflow-y-auto px-4 py-8 pb-32"
              >
                <div className="mx-auto max-w-4xl">
                  <motion.div
                    variants={childVariants}
                    className="rounded-lg border border-border bg-card p-6 shadow-lg"
                  >
                    {isLoadingResponse ? (
                      <>
                        <div className="mb-6">
                          <Skeleton className="h-8 w-64 mb-2" />
                          <Skeleton className="h-4 w-80" />
                        </div>
                        <div className="space-y-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-full mt-6" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                          <Skeleton className="h-4 w-full mt-6" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="mt-6 pt-6 border-t border-border">
                          <Skeleton className="h-10 w-32" />
                        </div>
                      </>
                    ) : (
                      <>
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
                          <ReactMarkdown>
                            {selectedProjectResponse}
                          </ReactMarkdown>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border">
                          <Link href={`/project/${selectedProjectId}`}>
                            <Button className="w-full sm:w-auto">
                              View Analytics
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="flex-1 flex items-center justify-center px-4 pb-32"
              >
                <div className="w-full max-w-3xl mx-auto text-center">
                  <motion.div variants={childVariants} className="mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                      {projectName ? (
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {projectName}
                        </span>
                      ) : (
                        <>
                          Storage{" "}
                          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Bank
                          </span>
                        </>
                      )}
                    </h1>
                    <p className="text-muted-foreground text-lg sm:text-xl">
                      {projectName
                        ? "Enter your project prompt."
                        : "Select a completed project and view its final output."}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Input Area - Fixed at Bottom - Only show if showInputBar is true and no project is selected */}
            {showInputBar && !selectedProjectId && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
                className="fixed bottom-0 left-0 right-0 lg:left-64 border-t border-border bg-background/95 backdrop-blur-sm z-30"
              >
                <div className="mx-auto max-w-3xl px-4 py-4">
                  {showInputSkeleton ? (
                    <div className="relative">
                      <div className="relative">
                        <Skeleton className="w-full h-12 rounded-md" />
                        <Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md" />
                      </div>
                      <Skeleton className="mt-2 h-3 w-32 mx-auto" />
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await handleSubmitPrompt(promptInput);
                      }}
                      className="relative"
                    >
                      <div className="relative">
                        <Input
                          type="text"
                          value={promptInput}
                          onChange={(e) => setPromptInput(e.target.value)}
                          onKeyDown={async (e) => {
                            if (
                              e.key === "Enter" &&
                              !isLoading &&
                              currentProjectId
                            ) {
                              e.preventDefault();
                              await handleSubmitPrompt(promptInput);
                            }
                          }}
                          placeholder="Enter your project prompt..."
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
                          disabled={!promptInput.trim() || isLoading}
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
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
