"use client"

import { motion } from "framer-motion"
import { staggerContainer, childVariants, viewportConfig } from "@/lib/animations"
import { Eye, Lightbulb, Edit3, Users } from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Observe",
    description: "See each reasoning step the AI takes.",
  },
  {
    icon: Lightbulb,
    title: "Understand",
    description: "Get plain-language explanations for each node.",
  },
  {
    icon: Edit3,
    title: "Modify",
    description: "Edit nodes and regenerate downstream logic instantly.",
  },
  {
    icon: Users,
    title: "Collaborate",
    description: "Share and export insights with your team.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={childVariants}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How It{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Works
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={childVariants}
                className="group relative rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 -z-10 rounded-lg bg-primary/0 blur-xl transition-all group-hover:bg-primary/10" />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

