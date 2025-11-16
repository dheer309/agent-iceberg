"use client"

import Image, { type StaticImageData } from "next/image"
import { motion } from "framer-motion"
import { staggerContainer, childVariants, viewportConfig } from "@/lib/animations"

// Import your logos (fixed relative paths)
import valyuLogo from "../../assets/valyu.png"
import nvidiaLogo from "../../assets/nvidia.png"
import awsLogo from "../../assets/aws.png"
import holisticLogo from "../../assets/holistic-ai.png"

type Sponsor = {
  id: string
  name: string
  tagline?: string
  logo: StaticImageData | string
}

const sponsors: Sponsor[] = [
  {
    id: "valyu",
    name: "Valyu",
    tagline: "Payroll financing intelligence",
    logo: valyuLogo,
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    tagline: "GPU acceleration partner",
    logo: nvidiaLogo,
  },
  {
    id: "aws",
    name: "AWS",
    tagline: "Cloud infrastructure",
    logo: awsLogo,
  },
  {
    id: "holistic-ai",
    name: "Holistic AI",
    tagline: "Responsible AI governance",
    logo: holisticLogo,
  },
]

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
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4"
        >
          {sponsors.map((sponsor) => (
            <motion.div
              key={sponsor.id}
              variants={childVariants}
              className="group relative flex flex-col items-center justify-between gap-4 rounded-lg border border-border bg-card p-6 text-center transition-all hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex h-24 w-full items-center justify-center">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name + " logo"}
                  width={160}
                  height={80}
                  className="max-h-20 w-auto object-contain"
                />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-wide text-foreground">
                  {sponsor.name}
                </p>
                {sponsor.tagline && (
                  <p className="text-xs text-muted-foreground">{sponsor.tagline}</p>
                )}
              </div>

              <div className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-primary/0 transition-all group-hover:bg-primary/5 group-hover:blur-sm" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}