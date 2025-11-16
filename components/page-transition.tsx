"use client"

import { motion } from "framer-motion"
import { fadeInUp, containerVariants, childVariants } from "@/lib/animations"
import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  className?: string
  useStagger?: boolean
}

export function PageTransition({ 
  children, 
  className = "",
  useStagger = false 
}: PageTransitionProps) {
  if (useStagger) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerChild({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  )
}

