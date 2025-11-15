"use client"

import { motion } from "framer-motion"
import { staggerContainer, childVariants, viewportConfig } from "@/lib/animations"
import { GraduationCap, Bug, Eye, Users } from "lucide-react"

const benefits = [
  {
    icon: GraduationCap,
    title: "Perfect for teaching AI concepts",
    description: "Visualize complex reasoning in an accessible way.",
  },
  {
    icon: Bug,
    title: "Great for debugging agent pipelines",
    description: "Identify bottlenecks and unexpected behavior quickly.",
  },
  {
    icon: Eye,
    title: "Makes complex reasoning transparent",
    description: "See exactly how AI arrives at its conclusions.",
  },
  {
    icon: Users,
    title: "Ideal for analysts and product teams",
    description: "Bridge the gap between technical and non-technical stakeholders.",
  },
]

export function WhyTeamsSection() {
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
            Why Teams{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Love It
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-2"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                variants={childVariants}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 transition-all group-hover:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                </div>
                <p className="text-muted-foreground">{benefit.description}</p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

