"use client"

import { motion } from "framer-motion"
import { staggerContainer, childVariants, viewportConfig } from "@/lib/animations"

const sponsors = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Sponsor Logo Placeholder ${i + 1}`,
}))

export function SponsorsSection() {
  return (
    <section className="relative bg-background py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={childVariants}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Supported by our{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Partners
            </span>
          </h2>
          <p className="text-muted-foreground">Sponsor logos shown here.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-4"
        >
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.id}
              variants={childVariants}
              className="group flex aspect-square items-center justify-center rounded-lg border border-border bg-card p-6 transition-all hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="text-center">
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  {sponsor.name}
                </div>
                <div className="h-12 w-full rounded bg-muted/50" />
              </div>

              {/* Hover pop effect */}
              <div className="absolute inset-0 -z-10 rounded-lg bg-primary/0 transition-all group-hover:bg-primary/5 group-hover:blur-sm" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

