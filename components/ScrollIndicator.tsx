"use client"

import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useMotionValue, animate } from "framer-motion"

export function ScrollIndicator() {
  const { scrollYProgress } = useScroll()
  const scale = useMotionValue(1)
  const opacity = useMotionValue(0)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Transform scroll progress to knob Y position
  // Track height is 60vh, we'll position the knob from top: 0 to top: calc(100% - 1rem)
  // Using percentage-based positioning with calc() for knob offset
  const knobTop = useTransform(scrollYProgress, (progress) => {
    const percent = progress * 100
    return `calc(${percent}% - 0.5rem)`
  })

  // Handle scroll events for fade in/out and scale effects
  useEffect(() => {
    const handleScroll = () => {
      // Fade in and scale up on scroll
      animate(opacity, 1, { duration: 0.2 })
      animate(scale, 1.2, { duration: 0.2, type: "spring", damping: 20, stiffness: 300 })

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Fade out after 1.5s of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        animate(opacity, 0, { duration: 0.5 })
        animate(scale, 1, { duration: 0.3, type: "spring", damping: 20, stiffness: 300 })
      }, 1500)
    }

    // Initial fade in
    animate(opacity, 1, { duration: 0.3 })

    // Listen to scroll events
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [opacity, scale])

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden md:block"
      aria-hidden="true"
    >
      {/* Track */}
      <motion.div
        style={{ opacity }}
        className="relative w-1 h-[60vh] bg-gray-400/20 rounded-full backdrop-blur-sm"
      >
        {/* Knob */}
        <motion.div
          style={{
            top: knobTop,
            scale,
            opacity,
          }}
          className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 via-purple-400 to-blue-500 shadow-lg shadow-purple-500/50 pointer-events-none"
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
          }}
        />
      </motion.div>
    </div>
  )
}

