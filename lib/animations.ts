import { Variants } from "framer-motion"

// Container variants for stagger animations
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
}

// Child variants for fade + slide up
export const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
}

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: {
      duration: 0.6,
      ease: "easeIn",
    },
  },
}

// Fade in from right
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: {
      duration: 0.6,
      ease: "easeIn",
    },
  },
}

// Fade in from bottom (slide up)
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 40,
    transition: {
      duration: 0.6,
      ease: "easeIn",
    },
  },
}

// Scale in animation
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
}

// Viewport configuration for scroll-triggered animations
export const viewportConfig = {
  once: false,
  amount: 0.3,
  margin: "0px 0px -100px 0px",
} as const

// Stagger container for columns/items
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
}

// Parallax scroll utilities (for future use)
export const useParallax = () => {
  // Placeholder for parallax hooks if needed later
  return null
}

