"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { HistoryTimeline } from "@/components/history-timeline";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fadeInUp, staggerContainer, childVariants } from "@/lib/animations";

export default function HistoryPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="border-b border-border bg-black pt-15"
      >
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/project/${id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Version History</h1>
              <p className="text-sm text-muted-foreground">
                Track changes and restore previous versions
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.1 }}
        className="mx-auto max-w-5xl px-4 py-8"
      >
        <HistoryTimeline projectId={id} />
      </motion.div>
    </div>
  );
}
