"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { staggerContainer, childVariants, viewportConfig } from "@/lib/animations"
import { Play, BookOpen, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function GetStartedSection() {
  const router = useRouter()

  const handleCreateProject = () => {
    router.push("/create-project")
  }

  return (
    <section className="relative bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={childVariants} className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Get Started in{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Minutes
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Start visualizing AI reasoning today. No technical knowledge required.
            </p>
          </motion.div>

          <motion.div
            variants={childVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={handleCreateProject}
              className="group relative gap-2 overflow-hidden border border-primary bg-primary/10 text-lg transition-all hover:border-primary hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              <span className="relative z-10">Start a New Analysis</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              {/* Neon border pulse on hover */}
              <div className="absolute inset-0 rounded-md border-2 border-primary opacity-0 blur-sm transition-opacity group-hover:opacity-50" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="group gap-2 border-border text-lg transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <Play className="h-5 w-5" />
              <span>Watch Demo</span>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="group gap-2 text-lg transition-all hover:bg-primary/5"
            >
              <BookOpen className="h-5 w-5" />
              <span>Documentation</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

