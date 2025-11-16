"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Undo2, Redo2, History, Download, Menu } from "lucide-react";

interface TopNavProps {
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  nodeCount: number;
  updatedAt: string;
}

export function TopNav({ projectId }: TopNavProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-black px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/create-project")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-lg font-semibold">
            {project?.name || "Loading..."}
          </h1>
          <p className="text-xs text-muted-foreground">
            Project ID: {projectId}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled>
          <Undo2 className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" disabled>
          <Redo2 className="h-5 w-5" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/project/${projectId}/history`)}
        >
          <History className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <Download className="h-5 w-5" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
