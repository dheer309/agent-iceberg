"use client"

import { motion } from "framer-motion"
import { fadeInLeft, fadeInRight, viewportConfig } from "@/lib/animations"
import { Network } from "lucide-react"

export function WhatIsSection() {
  return (
    <section className="relative bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left: Visual placeholder */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={fadeInLeft}
            className="relative"
          >
            <div className="relative aspect-square rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-8 backdrop-blur-sm">
              {/* Mock graph visualization */}
              <div className="flex h-full items-center justify-center">
                <div className="relative w-full max-w-md">
                  {/* Abstract graph representation */}
                  <div className="space-y-6">
                    {/* Node 1 */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-3 rounded-lg border border-primary/50 bg-card/50 px-4 py-3 backdrop-blur-sm">
                        <div className="rounded-full bg-primary p-2">
                          <Network className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Initial Query</div>
                          <div className="text-xs text-muted-foreground">User input</div>
                        </div>
                      </div>
                    </div>

                    {/* Connection line */}
                    <div className="mx-auto h-8 w-0.5 bg-gradient-to-b from-primary to-secondary" />

                    {/* Node 2 */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 rounded-lg border border-secondary/50 bg-card/50 px-3 py-2 backdrop-blur-sm">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                        <span className="text-xs">Step 1</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-secondary/50 bg-card/50 px-3 py-2 backdrop-blur-sm">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                        <span className="text-xs">Step 2</span>
                      </div>
                    </div>

                    {/* Connection line */}
                    <div className="mx-auto h-8 w-0.5 bg-gradient-to-b from-secondary to-primary" />

                    {/* Node 3 */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-3 rounded-lg border border-primary/50 bg-card/50 px-4 py-3 backdrop-blur-sm">
                        <div className="rounded-full bg-primary p-2">
                          <Network className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Final Output</div>
                          <div className="text-xs text-muted-foreground">Result</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 rounded-lg bg-primary/20 blur-3xl" />
            </div>
          </motion.div>

          {/* Right: Text content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={fadeInRight}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Understand How AI{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Thinks
              </span>
              —Visually.
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                This platform reveals an AI model&apos;s reasoning steps as an interactive graph.
                Explore every decision, tool call, and branch point.
              </p>
              <p>
                Modify steps and regenerate the outcome instantly. See how small changes cascade
                through the entire reasoning process.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

