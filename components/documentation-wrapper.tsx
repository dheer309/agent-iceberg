"use client"

import { motion } from "framer-motion"
import { fadeInUp } from "@/lib/animations"

interface DocumentationWrapperProps {
  children: React.ReactNode
}

export function DocumentationWrapper({ children }: DocumentationWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

