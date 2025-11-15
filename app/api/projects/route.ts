import { NextResponse } from "next/server";
import { mockProjectsStore } from "@/lib/mock-projects";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const projects = Object.values(mockProjectsStore);
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newProject = {
    id: String(Date.now()),
    name: body.name || "New Analysis",
    nodeCount: 0,
    updatedAt: new Date().toISOString(),
    response: "",
    userPrompt: "",
  };

  // Store the new project in the shared store
  mockProjectsStore[newProject.id] = newProject;

  // Write to mock-projects.ts file
  try {
    const filePath = path.join(process.cwd(), "lib", "mock-projects.ts");
    const fileContent = await fs.readFile(filePath, "utf-8");

    // Find the closing brace of the mockProjectsStore object
    const lastBraceIndex = fileContent.lastIndexOf("}");

    // Create the new project entry string
    const projectEntry = `  "${newProject.id}": {
    id: "${newProject.id}",
    name: "${newProject.name.replace(/"/g, '\\"')}",
    nodeCount: ${newProject.nodeCount},
    updatedAt: "${newProject.updatedAt}",
    userPrompt: "",
    response: \`\`,
  },
`;

    // Insert the new project before the closing brace
    const newContent =
      fileContent.slice(0, lastBraceIndex) +
      projectEntry +
      fileContent.slice(lastBraceIndex);

    await fs.writeFile(filePath, newContent, "utf-8");
  } catch (error) {
    console.error("Failed to write to mock-projects.ts:", error);
    // Continue even if file write fails
  }

  return NextResponse.json(newProject);
}
