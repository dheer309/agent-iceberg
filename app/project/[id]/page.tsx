"use client"

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ProjectWorkspace } from '@/components/project-workspace'
import { fadeInUp } from '@/lib/animations'

export default function ProjectPage() {
  const params = useParams()
  const id = params.id as string
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <ProjectWorkspace projectId={id} />
    </motion.div>
  )
}
