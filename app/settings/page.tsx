"use client";

import { motion } from "framer-motion";
import { SettingsForm } from "@/components/settings-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fadeInUp } from "@/lib/animations";

export default function SettingsPage() {
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
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Customize your Observable AI experience
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
        className="mx-auto max-w-4xl px-4 py-8"
      >
        <SettingsForm />
      </motion.div>
    </div>
  );
}
