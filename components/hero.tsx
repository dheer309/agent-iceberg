"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, ChevronDown } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

export function Hero() {
  const router = useRouter();

  const handleCreateProject = () => {
    router.push("/create-project");
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Observable AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-4 text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          Manufacturing AI{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Thoughts
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground text-pretty"
        >
          A visual AI builder that adapts to how you think, not the other way around.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button
            size="lg"
            onClick={handleCreateProject}
            className="shimmer-button group gap-2 relative"
          >
            <Plus className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Start a New Analysis</span>
          </Button>
        </motion.div>

      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="h-6 w-6 text-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
