import { NextResponse } from "next/server";
import { mockProjectsStore } from "@/lib/mock-projects";
import { promises as fs } from "fs";
import path from "path";
import { cleanPayload } from "@/lib/middleware/cleanPayload";

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get project from shared store
  const project = mockProjectsStore[id];

  if (project) {
    return NextResponse.json(project);
  }

  // Fallback for newly created projects not yet in store
  return NextResponse.json(
    {
      id,
      name: "New Analysis",
      nodeCount: 0,
      updatedAt: new Date().toISOString(),
      response: "",
      userPrompt: "",
    },
    { status: 200 }
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch (error) {
    // If JSON parsing fails, return error
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // Get project from shared store
  const project = mockProjectsStore[id];

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Update project with userPrompt if provided
  if (body.userPrompt !== undefined) {
    project.userPrompt = body.userPrompt;
    project.updatedAt = new Date().toISOString();

    // Update in shared store
    mockProjectsStore[id] = project;

    // Call external API and update sessionID
    try {
      // Step 1: Call localhost:8000/sessions with the prompt
      const sessionsResponse = await fetch("http://localhost:8000/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: body.userPrompt,
          enable_redteam: true,
          redteam_loops: 5,
        }),
      });

      if (!sessionsResponse.ok) {
        throw new Error(
          `External API returned status ${sessionsResponse.status}`
        );
      }

      const sessionsData = await sessionsResponse.text();

      // Write response to payload-1.txt
      const payload1Path = path.join(
        process.cwd(),
        "lib",
        "payloads",
        "payload-1.txt"
      );
      await fs.writeFile(payload1Path, sessionsData, "utf-8");

      // Parse JSON to extract session_id
      let sessionsJson: any;
      try {
        sessionsJson = JSON.parse(sessionsData);
      } catch (parseError) {
        throw new Error("Failed to parse sessions response as JSON");
      }

      const sessionId = sessionsJson.session_id;
      if (!sessionId) {
        throw new Error("session_id not found in response");
      }

      // Update sessionID in project
      project.sessionID = sessionId;
      mockProjectsStore[id] = project;

      // Step 2: Call localhost:8000/sessions/{sessionID}/step
      const stepResponse = await fetch(
        `http://localhost:8000/sessions/${sessionId}/step`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            steps: 1,
          }),
        }
      );

      if (!stepResponse.ok) {
        throw new Error(
          `External API step endpoint returned status ${stepResponse.status}`
        );
      }

      const stepData = await stepResponse.text();

      // Append response to graph-payload.ts as TypeScript export
      const graphPayloadPath = path.join(
        process.cwd(),
        "lib",
        "payloads",
        "graph-payload.ts"
      );
      try {
        const parsedData = JSON.parse(stepData);

        // Read existing file if it exists
        let existingPayloads: unknown[] = [];
        try {
          const existingContent = await fs.readFile(graphPayloadPath, "utf-8");
          // Try to extract the value from the export statement
          // Match: export const graphPayload = <value> as const
          // Use a more robust approach: find everything between "= " and " as const"
          const startIndex = existingContent.indexOf(
            "export const graphPayload = "
          );
          if (startIndex !== -1) {
            const valueStart =
              startIndex + "export const graphPayload = ".length;
            const asConstIndex = existingContent.indexOf(
              " as const",
              valueStart
            );
            const valueEnd =
              asConstIndex !== -1 ? asConstIndex : existingContent.length;
            const valueStr = existingContent
              .substring(valueStart, valueEnd)
              .trim();

            if (valueStr) {
              // Check if it's already an array
              if (valueStr.startsWith("[") && valueStr.endsWith("]")) {
                existingPayloads = JSON.parse(valueStr);
              } else {
                // It's a single object, convert to array
                const existingObject = JSON.parse(valueStr);
                existingPayloads = [existingObject];
              }
            }
          }
        } catch (readError) {
          // File doesn't exist or is invalid, start with empty array
          existingPayloads = [];
        }

        // Clean the payload to exclude content and image_url keys
        const cleanedData = cleanPayload(parsedData);

        // Append new payload to the array
        existingPayloads.push(cleanedData);

        // Write back as array
        const tsContent = `export const graphPayload = ${JSON.stringify(
          existingPayloads,
          null,
          2
        )} as const\n`;
        await fs.writeFile(graphPayloadPath, tsContent, "utf-8");
      } catch (parseError) {
        // If parsing fails, try to append as raw string
        try {
          let existingPayloads: unknown[] = [];
          try {
            const existingContent = await fs.readFile(
              graphPayloadPath,
              "utf-8"
            );
            const startIndex = existingContent.indexOf(
              "export const graphPayload = "
            );
            if (startIndex !== -1) {
              const valueStart =
                startIndex + "export const graphPayload = ".length;
              const asConstIndex = existingContent.indexOf(
                " as const",
                valueStart
              );
              const valueEnd =
                asConstIndex !== -1 ? asConstIndex : existingContent.length;
              const valueStr = existingContent
                .substring(valueStart, valueEnd)
                .trim();

              if (valueStr) {
                if (valueStr.startsWith("[") && valueStr.endsWith("]")) {
                  existingPayloads = JSON.parse(valueStr);
                } else {
                  const existingObject = JSON.parse(valueStr);
                  existingPayloads = [existingObject];
                }
              }
            }
          } catch (readError) {
            // File doesn't exist or is invalid, start with empty array
            existingPayloads = [];
          }

          // Parse and clean the stepData before saving
          const parsedStepData = JSON.parse(stepData);
          const cleanedStepData = cleanPayload(parsedStepData);

          existingPayloads.push(cleanedStepData);
          const tsContent = `export const graphPayload = ${JSON.stringify(
            existingPayloads,
            null,
            2
          )} as const\n`;
          await fs.writeFile(graphPayloadPath, tsContent, "utf-8");
        } catch (appendError) {
          // If everything fails, create new file with single entry
          // Parse and clean the stepData before saving
          const parsedStepData = JSON.parse(stepData);
          const cleanedStepData = cleanPayload(parsedStepData);

          const tsContent = `export const graphPayload = ${JSON.stringify(
            [cleanedStepData],
            null,
            2
          )} as const\n`;
          await fs.writeFile(graphPayloadPath, tsContent, "utf-8");
        }
      }
    } catch (error) {
      console.error("External API call failed:", error);
      return NextResponse.json(
        { error: "External API unavailable" },
        { status: 502 }
      );
    }

    // Write to mock-projects.ts file (including sessionID update)
    try {
      const filePath = path.join(process.cwd(), "lib", "mock-projects.ts");
      const fileContent = await fs.readFile(filePath, "utf-8");

      // Find the project entry in the file
      const projectKeyPattern = `"${id}"`;
      const keyIndex = fileContent.indexOf(projectKeyPattern);

      if (keyIndex !== -1) {
        // Find the opening brace after the key
        const openBraceIndex = fileContent.indexOf("{", keyIndex);
        if (openBraceIndex !== -1) {
          // Find the matching closing brace by counting braces
          let braceCount = 0;
          let closeBraceIndex = openBraceIndex;
          for (let i = openBraceIndex; i < fileContent.length; i++) {
            if (fileContent[i] === "{") braceCount++;
            if (fileContent[i] === "}") {
              braceCount--;
              if (braceCount === 0) {
                closeBraceIndex = i;
                break;
              }
            }
          }

          // Extract the project entry (object content only, without the key)
          const projectEntry = fileContent.substring(
            openBraceIndex + 1,
            closeBraceIndex
          );

          // Replace or add userPrompt in the project entry
          const escapedPrompt = body.userPrompt
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');
          let updatedProjectEntry: string;

          if (projectEntry.includes("userPrompt:")) {
            // Replace existing userPrompt
            updatedProjectEntry = projectEntry.replace(
              /userPrompt:\s*"[^"]*"/,
              `userPrompt: "${escapedPrompt}"`
            );
          } else {
            // Add userPrompt before the closing brace
            // Find the last property before the closing brace
            const trimmedEntry = projectEntry.trim();
            const lastNewlineIndex = trimmedEntry.lastIndexOf("\n");
            if (lastNewlineIndex !== -1) {
              // Insert userPrompt after the last property with proper indentation
              const lastLine = trimmedEntry.substring(lastNewlineIndex + 1);
              const indentMatch = lastLine.match(/^(\s+)/);
              const indent = indentMatch ? indentMatch[1] : "    ";
              updatedProjectEntry =
                projectEntry.trimEnd() +
                `,\n${indent}userPrompt: "${escapedPrompt}",`;
            } else {
              // Fallback: insert before closing brace
              updatedProjectEntry =
                projectEntry + `\n    userPrompt: "${escapedPrompt}",`;
            }
          }

          // Replace or add sessionID in the project entry (only if sessionID exists)
          if (project.sessionID) {
            const escapedSessionId = project.sessionID
              .replace(/\\/g, "\\\\")
              .replace(/"/g, '\\"');
            if (updatedProjectEntry.includes("sessionID:")) {
              // Replace existing sessionID
              updatedProjectEntry = updatedProjectEntry.replace(
                /sessionID:\s*"[^"]*"/,
                `sessionID: "${escapedSessionId}"`
              );
            } else {
              // Add sessionID after userPrompt
              if (updatedProjectEntry.includes("userPrompt:")) {
                updatedProjectEntry = updatedProjectEntry.replace(
                  /userPrompt:\s*"[^"]*"/,
                  `userPrompt: "${escapedPrompt}",\n    sessionID: "${escapedSessionId}"`
                );
              } else {
                // Fallback: add before closing brace
                const trimmedEntry = updatedProjectEntry.trim();
                const lastNewlineIndex = trimmedEntry.lastIndexOf("\n");
                if (lastNewlineIndex !== -1) {
                  const lastLine = trimmedEntry.substring(lastNewlineIndex + 1);
                  const indentMatch = lastLine.match(/^(\s+)/);
                  const indent = indentMatch ? indentMatch[1] : "    ";
                  updatedProjectEntry =
                    updatedProjectEntry.trimEnd() +
                    `,\n${indent}sessionID: "${escapedSessionId}",`;
                } else {
                  updatedProjectEntry =
                    updatedProjectEntry +
                    `\n    sessionID: "${escapedSessionId}",`;
                }
              }
            }
          }

          // Replace the old entry with the updated one
          const newContent =
            fileContent.substring(0, openBraceIndex + 1) +
            updatedProjectEntry +
            fileContent.substring(closeBraceIndex);

          await fs.writeFile(filePath, newContent, "utf-8");
        }
      }
    } catch (error) {
      console.error("Failed to write to mock-projects.ts:", error);
      // Continue even if file write fails
    }
  }

  return NextResponse.json(project);
}
