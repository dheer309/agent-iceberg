import { readFileSync } from "fs"
import { join } from "path"
import { DocumentationContent } from "@/components/documentation-content"
import { DocumentationHeader } from "@/components/documentation-header"
import { DocumentationWrapper } from "@/components/documentation-wrapper"

export default function DocumentationPage() {
  // Read README.md from the project root
  const readmePath = join(process.cwd(), "README.md")
  const readmeContent = readFileSync(readmePath, "utf-8")

  return (
    <div className="min-h-screen bg-background">
      <DocumentationHeader />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <DocumentationWrapper>
          <DocumentationContent content={readmeContent} />
        </DocumentationWrapper>
      </div>
    </div>
  )
}

