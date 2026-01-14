"use client"

import type React from "react"

import { useChatbot } from "@/lib/hooks/use-chatbot"
import { AIChatbot } from "./ai-chatbot"
import { ChatbotToggle } from "./chatbot-toggle"

interface CoursePageClientProps {
  courseId: string
  courseTitle: string
  children: React.ReactNode
}

export function CoursePageClient({ courseId, courseTitle, children }: CoursePageClientProps) {
  const { isOpen, toggle } = useChatbot()

  return (
    <>
      {children}
      <AIChatbot courseId={courseId} courseTitle={courseTitle} isOpen={isOpen} onToggle={toggle} />
      <ChatbotToggle isOpen={isOpen} onClick={toggle} />
    </>
  )
}
