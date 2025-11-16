"use client"

import { motion } from "framer-motion"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Brain, Wrench, GitBranch, PencilLine, MousePointer, Zap } from 'lucide-react'
import Link from 'next/link'
import { fadeInUp, staggerContainer, childVariants } from "@/lib/animations"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="border-b border-border bg-card pt-20"
      >
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Help & Onboarding</h1>
              <p className="text-sm text-muted-foreground">
                Learn how to use Observable AI
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="mx-auto max-w-5xl px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="mb-4 text-3xl font-bold text-center">Welcome to Observable AI</h2>
          <p className="mx-auto max-w-2xl text-center text-lg text-muted-foreground text-pretty">
            Observable AI helps you understand how AI makes decisions by visualizing
            the reasoning process as an interactive graph. No technical background needed!
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-12"
        >
          <motion.h3
            variants={childVariants}
            className="mb-6 text-2xl font-semibold"
          >
            Understanding Nodes
          </motion.h3>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={childVariants}>
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-500 p-2">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  Model Step
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Represents a decision or analysis made by the AI model itself.
                  These are the &quot;thinking&quot; steps where the AI processes information
                  and makes conclusions.
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={childVariants}>
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-full bg-green-500 p-2">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  Tool Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Shows when the AI uses an external tool or resource, like
                  searching a database, calling an API, or performing a calculation.
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={childVariants}>
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-500 p-2">
                    <GitBranch className="h-5 w-5 text-white" />
                  </div>
                  Branch Point
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A decision point where the AI reasoning splits into different paths
                  based on conditions or multiple possible approaches.
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={childVariants}>
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-500 p-2">
                    <PencilLine className="h-5 w-5 text-white" />
                  </div>
                  User Edit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Marks steps that you&apos;ve manually modified or added. These show
                  where human intervention has shaped the AI&apos;s reasoning process.
                </p>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-12"
        >
          <motion.h3
            variants={childVariants}
            className="mb-6 text-2xl font-semibold"
          >
            Quick Start Guide
          </motion.h3>
          <div className="space-y-4">
            <motion.div variants={childVariants}>
              <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-full bg-primary p-3">
                  <MousePointer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Click Any Node</h4>
                  <p className="text-muted-foreground">
                    Select a node to see detailed information about that step, including
                    what the AI did and why.
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={childVariants}>
              <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-full bg-secondary p-3">
                  <PencilLine className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Modify Steps</h4>
                  <p className="text-muted-foreground">
                    Describe how you want to change a step, and the system will regenerate
                    that node and all downstream reasoning automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={childVariants}>
              <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-full bg-purple-500 p-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Experiment Freely</h4>
                  <p className="text-muted-foreground">
                    Try different approaches by creating branches, disabling nodes,
                    or regenerating from any point. All changes are tracked in version history.
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="mb-2 text-xl font-semibold">Need More Help?</h3>
              <p className="mb-4 text-muted-foreground">
                Check out our detailed documentation or contact support
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline">View Documentation</Button>
                <Button className="bg-primary hover:bg-primary/90">Contact Support</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
