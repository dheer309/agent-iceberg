"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { fadeInUp } from "@/lib/animations"

export function DocumentationHeader() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="border-b border-border bg-black pt-15"
    >
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Documentation</h1>
            <p className="text-sm text-muted-foreground">
              Complete technical documentation for Observable AI
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

